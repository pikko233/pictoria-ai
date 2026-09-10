import * as React from "react";

interface EmailTemplateProps {
  username: string;
  message: string;
}

export function EmailTemplate({ username, message }: EmailTemplateProps) {
  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>{message}</p>
    </div>
  );
}
