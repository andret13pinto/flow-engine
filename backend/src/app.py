from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from collections import OrderedDict
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from models import Flow, Node
from schemas import FlowDto, FlowState, NodeType
from langchain.prompts import ChatPromptTemplate
from llm_config import llm
import json
import utils
from database import init_db, SessionLocal
import logging

from google_auth import auth

DATABASE = "/app/data/execution_engine.db"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    init_db()


# Database Connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)


# CRUD Endpoints
@app.post("/flows/")
def create_flow(flow_dto: FlowDto, db: Session = Depends(get_db)):
    flow = Flow(name=flow_dto.name, id=flow_dto.id)
    db.add(flow)
    for node in flow_dto.nodes:
        db.add(Node(**node.model_dump(), flow_id=flow.id))
    db.commit()
    db.refresh(flow) # Refresh the flow object to get the nodes
    return flow_dto


@app.get("/flows/")
def get_all_flows(db: Session = Depends(get_db)):
    return db.query(Flow).options(joinedload(Flow.nodes)).all()


@app.get("/flows/{flow_id}")
def get_flow(flow_id: str, db: Session = Depends(get_db)):
    flow = db.query(Flow).filter(Flow.id == flow_id).first()
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found.")
    logging.info(f"Flow: {flow}")
    return flow


@app.put("/flows/{flow_id}")
def update_flow(flow_id: str, flow_update_dto: FlowDto, db: Session = Depends(get_db)):
    flow = db.query(Flow).filter(Flow.id == flow_id).first()
    print(flow_update_dto)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found.")

    db.delete(flow)
    try:
        updated_flow = Flow(name=flow_update_dto.name, id=flow_update_dto.id)
        for node in flow_update_dto.nodes:
            db.add(Node(**node.model_dump(), flow_id=flow.id))
        db.add(updated_flow)
        db.commit()
    except Exception as e:
        logging.error(f"Failed to update flow: {e}")
        print(e)
        raise HTTPException(status_code=500, detail="Failed to update flow.")
    return flow_update_dto


@app.delete("/flows/{flow_id}", status_code=204)
def delete_flow(flow_id: str, db: Session = Depends(get_db)):
    flow = db.query(Flow).filter(Flow.id == flow_id).first()
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found.")
    db.delete(flow)
    db.commit()
    return None


@app.post("/flows/{flow_id}/execute")
def execute_flow(flow_id: str, db: Session = Depends(get_db)):
    # Authenticate Google Docs API and Google Drive API
    print("Authenticating Google Docs and Google Drive APIs")
    google_docs_service = auth.authenticate_google_docs()
    google_drive_service = auth.authenticate_google_drive()

    flow = db.query(Flow).filter(Flow.id == flow_id).first()
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found.")

    flow.state = FlowState.IN_PROGRESS
    db.commit()

    try:
        # 2. Get nodes that belong to the flow
        nodes = db.query(Node).filter(Node.flow_id == flow_id).all()

        # 3. Execute the flow by iterating over the nodes
        data = OrderedDict()
        for node in nodes:
            if node.type == NodeType.READ_FROM_GOOGLE_DOCS:
                # Authenticate Google Docs API

                doc_match = utils.search_google_docs_by_name(
                    google_drive_service, node.config.strip('"')
                )

                if not doc_match:
                    db.state = FlowState.COMPLETED_WITH_ERRORS
                    db.commit()
                    raise HTTPException(status_code=404, detail="Document not found.")

                document_id = doc_match[0]["id"]

                doc = (
                    google_docs_service.documents()
                    .get(documentId=document_id)
                    .execute()
                )
                doc_content = doc.get("body", {}).get("content", [])

                # Extract text from document
                text = ""
                for element in doc_content:
                    if "paragraph" in element:
                        for elem in element["paragraph"]["elements"]:
                            if "textRun" in elem:
                                text += elem["textRun"]["content"]

                data[node.id] = text

            elif node.type == NodeType.PROMPT_LLM:
                # Mock LLM execution
                prompt_template = ChatPromptTemplate.from_template(node.config)
                prompt = prompt_template.format(text=list(data.values())[-1])
                # Call the LLM using LangChain
                try:
                    result = llm.predict(prompt)
                    logging.info(
                        f"Prompted LLM using LangChain and received response :{result}"
                    )
                    data[node.id] = result
                except Exception as e:
                    logging.error(f"Error prompting LLM with LangChain: {e}")
                    raise HTTPException(
                        status_code=500, detail="Failed to generate response from LLM"
                    )

            elif node.type == NodeType.WRITE_TO_GOOGLE_DOCS:
                # Create a new Google Doc with the name provided in node.config
                doc_name = node.config.strip('"')
                new_doc = (
                    google_docs_service.documents()
                    .create(body={"title": doc_name})
                    .execute()
                )
                new_doc_id = new_doc.get("documentId")

                # Write the summary to the new Google Doc
                google_docs_service.documents().batchUpdate(
                    documentId=new_doc_id,
                    body={
                        "requests": [
                            {
                                "insertText": {
                                    "location": {"index": 1},
                                    "text": list(data.values())[-1],
                                }
                            }
                        ]
                    },
                ).execute()

                data[node.id] = f"Saved in file: {doc_name}"

                # Move the file to "My Drive"
                google_drive_service.files().update(
                    fileId=new_doc_id, addParents="root"
                ).execute()
    except Exception:
        flow.state = FlowState.COMPLETED_WITH_ERRORS
        db.commit()
        logging.error("Failed to execute flow.", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to execute flow.")

    else:
        flow.state = FlowState.COMPLETED_SUCESSFULLY
        flow.result = json.dumps(data)
        db.commit()
        return {"message": "Flow executed successfully.", "result": data}
