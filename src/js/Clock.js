import React, { useState, useEffect } from "react";

export default Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timerId)
  }, []);
  return (
    <div className="ps-2">
      <div>
        <span className="bi bi-clock me-2"/>
        {time.toLocaleTimeString()} - {time.toLocaleDateString()}
      </div>
    </div>
  )
}
