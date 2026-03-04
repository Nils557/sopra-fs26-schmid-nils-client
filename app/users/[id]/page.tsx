"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, Spin } from "antd";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { userAgent } from "next/server";

//Defines what columns the user table has and which User field each column displays
const columns: TableProps<User>["columns"] = [
  { title: "Username", dataIndex: "username", key: "username" }, //shows user.username
  { title: "Bio", dataIndex: "bio", key: "bio" }, //...
  { title: "Id", dataIndex: "id", key: "id" },
];

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { id } = useParams();

  const [users, setUsers] = useState<User[] | null>(null); //stores fetched users, null = not loaded yet
  const [isClient, setIsClient] = useState(false); //tracks if we're running in the browser yet
  
  const { clear: clearToken } = useLocalStorage<string>("token", ""); // clears token from localStorage
  const { clear: clearUserId } = useLocalStorage<string>("userId", ""); // clears id from localStorage

  //checks if we are in browser
  useEffect(() => {
    setIsClient(true);
  }, []); //[] runs once, [user] at the start and every time the user changes

  //redirect to login if no token
  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        router.push("/login");
      }
    }
  }, [isClient, router]); //does it at start and every time isClient or router change


  //fetch all users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        //GET /users -> returns a list of all users
        const response = await apiService.get<User[]>("/users");
        setUsers(response.data); //store users in state -> triggers re-render (to actually show the users)
      } catch (error) {
        console.error("Error while loading:", error);
      }
    };

    //Only fetch if we're in the browser AND a token exists (user is logged in)
    if (isClient && localStorage.getItem("token")) { 
      fetchUsers();
    }
  }, [apiService, isClient]); //re-runs if apiService or isClient changes

  const handleLogout = async () => {
    try {
      //POST /logout/{id} → tells the backend to set user status to OFFLINE
      await apiService.post<void>("/logout/" + id, {});
    } catch (e) {
      console.error("Logout failed", e); //log error but don't block logout
    } finally {
      clearToken();
      clearUserId();
      router.push("/login");
    }
  };
  //Loading screen: Show spinner if: not yet client-side OR client-side but no token yet
  if (!isClient || (isClient && !localStorage.getItem("token"))) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Verifying session..." />
      </div>
    );
  }

  return (
    <div className="card-container">
      <Card
        title="User Profile & Dashboard"
        loading={!users} //shows Ant Design skeleton loader while users is null
        style={{ width: "100%", maxWidth: "800px", margin: "20px auto" }}
      >
        {users && ( // only render content once users have loaded
          <>
            <Table<User>
              columns={columns}
              dataSource={users} //the array of users to display
              rowKey="id"   //unique key for each row (uses user.id)
              onRow={(row) => ({
                onClick: () => router.push(`/webprofile/${row.id}`),
                style: { cursor: "pointer" }, // show pointer cursor on hover
              })}
            />
            <div style={{ marginTop: 20, display: 'flex', gap: '10px' }}>
              <Button onClick={handleLogout} type="primary" danger>
                Logout
              </Button>
              <Button onClick={() => router.push("/resetpassword")}>
                Reset Password
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Profile;