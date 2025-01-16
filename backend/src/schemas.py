from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from enum import IntEnum


class NodeType(IntEnum):
    READ_FROM_GOOGLE_DOCS = 1
    WRITE_TO_GOOGLE_DOCS = 2
    PROMPT_LLM = 3


class FlowState(IntEnum):
    NOT_STARTED = 1
    IN_PROGRESS = 2
    COMPLETED_SUCESSFULLY = 3
    COMPLETED_WITH_ERRORS = 4


class NodeDto(BaseModel):
    """
    NodeDto is a Pydantic model that represents the Node model.
    """

    id: str
    type: int
    config: Optional[str] = None


class FlowDto(BaseModel):
    """
    FlowDto is a Pydantic model that represents the Flow model.
    """

    id: str
    name: str
    nodes: list[NodeDto]
