import {SignIn} from "@clerk/react";
import {Card, CardBody} from "@heroui/react";

export default function SignInPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-md border border-slate-200">
                <CardBody>
                    <SignIn routing="path" path="/sign-in"/>
                </CardBody>
            </Card>
        </div>
    );
}
