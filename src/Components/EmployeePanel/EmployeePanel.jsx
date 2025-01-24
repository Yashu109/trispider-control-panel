import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { auth } from "../../firebase"; // Import your Firebase auth setup

const EmployeeDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completionStatus, setCompletionStatus] = useState({}); // To track completion inputs

  useEffect(() => {
    const fetchEmployeeProjects = async () => {
      try {
        setLoading(true);
        setError("");

        // Get the currently logged-in user
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not logged in");
        }

        // Assume the user's name is used to match (e.g., "yashwanth")
        const employeeName = user.displayName || "yashwanth"; // Replace with dynamic logic

        const db = getDatabase();
        const projectsRef = ref(db, "projects");

        onValue(projectsRef, (snapshot) => {
          if (snapshot.exists()) {
            const allProjects = snapshot.val();
            const assignedProjects = [];

            // Iterate through projects to find matches
            Object.entries(allProjects).forEach(([projectId, projectData]) => {
              if (
                projectData.Assign_To?.includes(employeeName) ||
                projectData.assignments?.some((a) => a.assignee === employeeName)
              ) {
                assignedProjects.push({ projectId, ...projectData });
              }
            });

            setProjects(assignedProjects);
          } else {
            setError("No projects found");
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProjects();
  }, []);

  const handleCompletionChange = (projectId, assignee, value) => {
    setCompletionStatus((prevState) => ({
      ...prevState,
      [projectId]: {
        ...prevState[projectId],
        [assignee]: value,
      },
    }));
  };

  const saveCompletionStatus = async (projectId, assignee) => {
    const db = getDatabase();

    try {
      // Check if the input is valid
      const status = completionStatus[projectId]?.[assignee];
      if (!status || parseInt(status) < 0 || parseInt(status) > 100) {
        alert("Please enter a valid percentage (0-100).");
        return;
      }

      // Update Firebase assignments
      const updates = {};
      updates[`/projects/${projectId}/assignments`] = {
        ...projects.find((p) => p.projectId === projectId).assignments,
        [assignee]: {
          ...projects.find((p) => p.projectId === projectId).assignments?.[assignee],
          taskCompleted: `${status}% task is completed`,
        },
      };

      await update(ref(db), updates);
      alert("Task status updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update task status. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Assigned Projects</h1>
      {projects.length === 0 ? (
        <p>No projects assigned</p>
      ) : (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Project Type</th>
              <th>Advance Payment</th>
              <th>Alternative Number</th>
              <th>Scope of Work</th> {/* New column for ScopeOfWork */}
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              // Calculate the percentage for each assignee
              const assignees = project.Assign_To?.split(", ") || [];
              const percentage = assignees.length > 0 ? 100 / assignees.length : 0;

              return (
                <tr key={project.projectId}>
                  <td>{project.projectId}</td>
                  <td>{project.ProjectType}</td>
                  <td>{project.advancePayment}</td>
                  <td>{project.alternativeNumber}</td>
                  <td>{project.scopeOfWork || "N/A"}</td> {/* Display ScopeOfWork */}
                  <td>
                    {assignees.map((assignee, index) => (
                      <div key={index} style={{ marginBottom: "20px" }}>
                        <strong>{assignee}</strong> ({percentage.toFixed(2)}%)
                        <div
                          style={{
                            marginTop: "5px",
                            padding: "5px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            background: "#f9f9f9",
                            fontSize: "0.9rem",
                          }}
                        >
                          <label htmlFor={`${project.projectId}-${assignee}`}>
                            Task Completion (%):
                          </label>
                          <input
                            type="number"
                            id={`${project.projectId}-${assignee}`}
                            value={
                              completionStatus[project.projectId]?.[assignee] || ""
                            }
                            onChange={(e) =>
                              handleCompletionChange(
                                project.projectId,
                                assignee,
                                e.target.value
                              )
                            }
                            style={{ marginLeft: "10px", width: "60px" }}
                          />
                          <button
                            onClick={() =>
                              saveCompletionStatus(project.projectId, assignee)
                            }
                            style={{
                              marginLeft: "10px",
                              padding: "5px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeDashboard;
