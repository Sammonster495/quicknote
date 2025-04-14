import { LogOut, User } from "lucide-react";
import { signOut, signIn, useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export function LoginButton() {
    const { data: session } = useSession()

  return (
    <>
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full cursor-pointer focus:outline-none">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-lg font-semibold">{session.user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="focus:outline-none cursor-pointer">
              <LogOut className="mr-2 h-6 w-6" />
              <span className="text-lg">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => signIn("google")} size="sm" className="flex border p-2 cursor-pointer" >
            Sign in
        </Button>
      )}
    </>
  )
}
