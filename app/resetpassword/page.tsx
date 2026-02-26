"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message, App } from "antd";

// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";


    const Login: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();

    const resetPassword = async (values: any) => {
        const {npassword, repeat_password} = values;
        const userIdRaw = localStorage.getItem('userId');
        const userId = userIdRaw ? userIdRaw.replace(/"/g, '') : ''; 

await apiService.put("/users/" + userId, {
  password: npassword 
});

        if (npassword !== repeat_password) {
            message.error("The passwords must match!");
            return;
        }

        try {

            await apiService.put("/users/" + userId, {
            password: npassword 
            });
            
            message.success("Password changed successfully");
            router.push("/login")
        } catch (error) {
            message.error("Failed to update password");
        }
    };


    return (
        <App> 
        <div className="login-container">
            <Form
            form={form}
            name="login"
            size="large"
            variant="outlined"
            onFinish={resetPassword}
            layout="vertical"
            >
            <Form.Item>
                <h1>Change your password</h1>
                You are currently logged in to the account with the id: {localStorage.getItem('userId')}
                <p>You are changing the password linked to your id.</p>
            </Form.Item>
            <Form.Item
                name="npassword"
                label="New password"
                rules={[{ required: true, message: "Please input your new password!" }]}
            >
                <Input.Password placeholder="Enter new password" />
            </Form.Item>
            
            <Form.Item
                name="repeat_password"
                label="Repeat new password"
                dependencies={['npassword']} 
                rules={[
                { required: true, message: "Please repeat your password" },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                    if (!value || getFieldValue('npassword') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                    },
                }),
                ]}
            >
                <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button">
                Reset
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="button" className="grey-button" onClick={() => router.back()}>
                Back
                </Button>
            </Form.Item>
            </Form>
        </div>
        </App> 
    );
    };
export default Login;
