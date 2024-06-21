export const useNotification = () => {
  const toast = useToast();
  return function notification({
    id,
    title,
    description,
    type = "success",
  }: {
    id?: string;
    title: string;
    description: string;
    type?: "success" | "error" | "warning" | "info";
  }) {
    const color =
      type === "success"
        ? "primary"
        : type === "error"
        ? "rose"
        : type === "warning"
        ? "yellow"
        : "blue";
    toast.add({
      id,
      title,
      description,
      color: color,
    });
  };
};
