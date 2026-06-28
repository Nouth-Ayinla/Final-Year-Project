import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, ShieldX } from "lucide-react";
import Link from "next/link";

export default function NotAdminRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg border-destructive/20">
        <CardHeader className="text-center space-y-4">
          {/* Icon container */}
          <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
            <ShieldX className="size-14 text-destructive" />
          </div>

          <CardTitle className="text-2xl font-semibold">
            Access Restricted
          </CardTitle>

          <CardDescription className="text-base text-muted-foreground">
            You don’t have admin privileges to view this page.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, contact the system administrator.
          </p>
        </CardContent>

        <div className="p-4">
          <Link
            href="/"
            className={buttonVariants({
              className: "w-full  ",
            })}
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
