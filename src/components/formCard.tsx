import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./theme-toggle";

export function CardDemo() {
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Set Your Profile</CardTitle>
				<CardDescription>Enter your email below to login to your account</CardDescription>
				<CardAction>
				<span>

        		<ModeToggle />
        </span>
    
				</CardAction>
			</CardHeader>
			<CardContent>
				<form>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="username">Your Username</Label>
							<div className="flex items-center gap-2">
								<span>@</span>
								<Input id="username" type="text" placeholder="Jhon_doe" required />
							</div>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="interests">Stuff you like</Label>
							</div>
							<Input id="interests" type="text" required />
						</div>
					</div>
				</form>
			</CardContent>
			<CardFooter className="flex-col gap-2">
				<Button type="submit" className="w-full">
					save
				</Button>
			</CardFooter>
		</Card>
	);
}
