import React, { useEffect, useState } from "react";

function Test() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test/")
      .then(res => res.json())
      .then(data => {
        console.log(data);   // check console
        setMessage(data.message);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default Test;