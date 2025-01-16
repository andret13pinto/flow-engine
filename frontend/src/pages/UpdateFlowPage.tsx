import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flow } from "../types";
import UpdateFlowPanel from "../components/UpdateFlowPanel";

interface UpdateFlowPageProps {
  flows: Flow[] | null;
  onUpdateFlow: (updatedFlow: Flow) => void;
}

const UpdateFlowPage: React.FC<UpdateFlowPageProps> = ({
  flows,
  onUpdateFlow,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!flows) {
    return <p>Loading flows...</p>;
  }

  const flow = flows.find((flow) => String(flow.id) === id);

  if (!flow) {
    return <p>Flow not found.</p>;
  }

  const handleSave = (updatedFlow: Flow) => {
    onUpdateFlow(updatedFlow);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-600 text-white py-4 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">Flow Manager</h1>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 text-white py-10 px-4 text-center">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Update Flow</h2>
          <p className="text-gray-100 text-sm md:text-base max-w-2xl mx-auto">
            Modify your flow configuration below.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="-mt-8 pb-12 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-8">
            <UpdateFlowPanel
              flow={flow}
              onSave={handleSave}
              onCancel={() => navigate("/")}
            />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-200 text-gray-600 py-4 mt-auto text-center text-sm">
        © {new Date().getFullYear()} Flow Manager.
      </footer>
    </div>
  );
};

export default UpdateFlowPage;
