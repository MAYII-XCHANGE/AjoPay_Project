import { Link } from "react-router-dom";
import { ShieldIcon } from "../components/icons";
import { Card, EmptyState } from "../components/ui";
import { useAuth } from "../contexts/auth-context";

export function UnauthorizedPage() {
  const { user } = useAuth();
  const destination = user?.role === "USER" ? "/dashboard" : user ? "/admin" : "/login";
  return <main className="page page--narrow"><Card><EmptyState icon={<ShieldIcon />} title="You don’t have access" text="Your account role does not permit this page." action={<Link className="button button--primary" to={destination}>Return to your dashboard</Link>} /></Card></main>;
}

export function NotFoundPage() {
  return <main className="page page--narrow"><Card><EmptyState icon={<ShieldIcon />} title="Page not found" text="The page you requested does not exist." action={<Link className="button button--primary" to="/">Go home</Link>} /></Card></main>;
}
