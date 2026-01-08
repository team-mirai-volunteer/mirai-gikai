export default function ChatLogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`body { background-color: #F7F4F0 !important; }`}</style>
      {children}
    </>
  );
}
