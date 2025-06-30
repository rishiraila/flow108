// /src/app/UserDetails/page.js
import { Suspense } from "react";
import UserDetailsClient from "./userdeatils"; // rename your component file from page.js -> UserDetailsClient.js

export default function Page() {
  return (
    <Suspense fallback={<div>Loading user details...</div>}>
      <UserDetailsClient />
    </Suspense>
  );
}
