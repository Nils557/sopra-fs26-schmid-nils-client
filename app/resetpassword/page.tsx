"use client"; 

import React from "react";
import { useRouter } from "next/navigation"; 
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message, App } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";


//Defines the shape of the reset password form. Both fields are required bc there is no ?
interface ResetPasswordValues {
  npassword: string;
  repeat_password: string;
}

const ResetPassword: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();
    const { clear: clearToken } = useLocalStorage<string>("token", ""); // clears token from localStorage
    const { clear: clearUserId } = useLocalStorage<string>("userId", ""); // clears id from localStorage

    const resetPassword = async (values: ResetPasswordValues) => {
        //Destructure both password fields from the form values
        const { npassword, repeat_password } = values;
        //Read userId from localStorage and strip any accidental quotes
        //'"5"' -> '5'
        const userIdRaw = localStorage.getItem('userId');
        const userId = userIdRaw ? userIdRaw.replace(/"/g, '') : ''; 

        if (npassword !== repeat_password) {
            message.error("The passwords must match!");
            return; //stop here
        }

        if (!userId) {
            message.error("User ID not found. Please log in again.");
            return; //stop here
        }

        try {
            //Send PUT request to "/users/{id}" with just the new password
            //The backend's updateUser handles the password update logic
            await apiService.put(`/users/${userId}`, {
                password: npassword 
            });
            
            message.success("Password changed successfully");
            clearToken();
            clearUserId();
            router.push("/login");
            //Log the full error for debugging, show a short message to the user
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
                    dependencies={['npassword']} //looks that the passwords are the same
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