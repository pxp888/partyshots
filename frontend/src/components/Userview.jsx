import { useParams } from "react-router-dom";

function Userview({ currentUser }) {
  const { username } = useParams();

  return (
    <div className="userview">
      <h2>User View</h2>
      <p>User: {username}</p>
    </div>
  );
}

export default Userview;
