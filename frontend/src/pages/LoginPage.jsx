import LoginModal from "../components/LoginModal";

export default function LoginPage({ isOpen, onClose, onLogin }) {
  return <LoginModal isOpen={isOpen} onClose={onClose} onLogin={onLogin} />;
}
