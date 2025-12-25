import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <button
      className="px-4 -py-0.5 rounded-xl bg-[#FFC000] text-white hover:bg-yellow-500 font-bold text-sm"
      onClick={handleLogout}
    >
      Log out
    </button>
  );
};

export default Logout;
