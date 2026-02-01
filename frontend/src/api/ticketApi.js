import API from "./api";

export const createTicket = async (description) => {
  const res = await API.post("/tickets", { description });
  return res.data;
};

export const getMyTickets = async () => {
  const res = await API.get("/tickets/my");
  return res.data;
};

export const getPendingTickets = async () => {
  const res = await API.get("/tickets/pending");
  return res.data;
};

export const getMyQueue = async () => {
  const res = await API.get("/tickets/my-queue");
  return res.data;
};
