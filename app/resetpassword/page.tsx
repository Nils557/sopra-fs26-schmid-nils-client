"use client"; 

import React from "react";
import { useRouter } from "next/navigation"; 
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message, App } from "antd";

interface ResetPasswordValues {
  npassword: string;
  repeat_password: string;
}

const ResetPassword: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();

    const resetPassword = async (values: ResetPasswordValues) => {
        const { npassword, repeat_password } = values;
        const userIdRaw = localStorage.getItem('userId');
        const userId = userIdRaw ? userIdRaw.replace(/"/g, '') : ''; 

        if (npassword !== repeat_password) {
            message.error("The passwords must match!");
            return;
        }

        if (!userId) {
            message.error("User ID not found. Please log in again.");
            return;
        }

        try {
            await apiService.put(`/users/${userId}`, {
                password: npassword 
            });
            
            message.success("Password changed successfully");
            router.push("/login");
        } catch (error) {
            console.error("Update failed:", error);
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
                    <p>You are changing the password linked to your ID.</p>
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
                    <Button type="default" htmlType="button" className="grey-button" onClick={() => router.back()}>
                    Back
                    </Button>
                </Form.Item>
            </Form>
        </div>
        </App> 
    );
};

export default ResetPassword;