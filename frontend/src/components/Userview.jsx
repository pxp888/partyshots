import { useParams } from "react-router-dom";

function Userview() {
  const { id } = useParams();

  return (
    <div className="userview">
      <h2>User View</h2>
      <p>User ID: {id}</p>
    </div>
  );
}

export default Userview;
