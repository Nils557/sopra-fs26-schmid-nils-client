// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React from "react";
import { useParams, useRouter, useServerInsertedHTML } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const {id} = useParams()

  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  const handleLogout = async() => {
    try {
      await apiService.post<User>("/logout/" + id, {});
      clearToken();
      clearUserId();
    } catch (e) {
        console.error("Logout failed", e);
    } finally {
      clearToken();
      clearUserId();
      router.push("/");
      }
  }

  return (
    <div className="card-container">
      <p>
        <strong>SampleUser</strong>
      </p>
        <Form.Item>
          <Button type="primary" className="grey-button" onClick={() => handleLogout()}>
            logout
          </Button>
        </Form.Item>
    </div>

  );
};

export default Profile;