import { useEffect, useState } from "preact/hooks";

const Message = (
  { message, timeout }: {
    message: string | null | undefined;
    timeout: number | null;
  },
) => {
  const [msg, setMessage] = useState<string | null | undefined>(message);
  useEffect(() => {
    if (!timeout) return;
    setTimeout(() => {
      setMessage(null);
    }, timeout);
  }, []);
  return (
    <>
      {msg
        ? (
          <h3 className={"text-red-600 text-lg mt-7"}>
            {msg}
          </h3>
        )
        : null}
    </>
  );
};

export default Message;
