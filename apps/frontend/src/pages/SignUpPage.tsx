import {SignUp} from "@clerk/react";
import {Card, CardBody} from "@heroui/react";

export default function SignUpPage() {
    return (
        <div className="flex justify-center">
            <Card className="w-full max-w-md border border-slate-200">
                <CardBody>
                    <SignUp routing="path" path="/sign-up"/>
                </CardBody>
            </Card>
        </div>
    );
}
