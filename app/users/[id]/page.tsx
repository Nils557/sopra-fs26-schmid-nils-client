"use client";

import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, Spin } from "antd";
import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";

const columns: TableProps<User>["columns"] = [
  { title: "Username", dataIndex: "username", key: "username" },
  { title: "Bio", dataIndex: "bio", key: "bio" },
  { title: "Id", dataIndex: "id", key: "id" },
];

const Profile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { id } = useParams();

  const [users, setUsers] = useState<User[] | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  useEffect(() => {
    setIsClient(true);
  }, []);

 
  useEffect(() => {
    if (isClient) {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        router.push("/login");
      }
    }
  }, [isClient, router]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response: any = await apiService.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error while loading:", error);
      }
    };

    if (isClient && localStorage.getItem("token")) { 
      fetchUsers();
    }
  }, [apiService, isClient]);

  const handleLogout = async () => {
    try {
      await apiService.post<any>("/logout/" + id, {});
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      clearToken();
      clearUserId();
      router.push("/login");
    }
  };


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
        loading={!users}
        style={{ width: "100%", maxWidth: "800px", margin: "20px auto" }}
      >
        {users && (
          <>
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/webprofile/${row.id}`),
                style: { cursor: "pointer" },
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