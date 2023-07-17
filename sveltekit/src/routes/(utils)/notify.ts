import toast, { type ToastPosition } from "svelte-french-toast";

const style =
  "background: #333; color: #fff; border: 1px solid orange; font-size: 1.3rem; white-space: nowrap; max-width: 80vw";

const ERROR_DURATION_MS = 10000;
const MESSAGE_DURATION_MS = 5000;

export const notify = {
  error: (msg: string, position: ToastPosition = "bottom-center") =>
    toast.error(msg, {
      style,
      duration: ERROR_DURATION_MS,
      position,
    }),

  info: (msg: string, position: ToastPosition = "bottom-center") =>
    toast(msg, {
      style,
      position,
      duration: MESSAGE_DURATION_MS,
    }),

  success: (msg: string, position: ToastPosition = "bottom-center") =>
    toast.success(msg, { style, position, duration: MESSAGE_DURATION_MS }),

  infiniteLoading: (msg: string, position: ToastPosition = "bottom-center") => {
    const id = toast.loading(msg, {
      style,
      position,
      duration: MESSAGE_DURATION_MS,
    });
    return { remove: () => toast.remove(id) };
  },

  remove: (id: string) => toast.remove(id),

  promiseLoading: (
    p: Promise<any>,
    loadingMsg: string,
    successMsg: string,
    errorMsg: string,
    position: ToastPosition = "bottom-center",
  ) =>
    toast.promise(
      p,
      {
        loading: loadingMsg,
        success: successMsg,
        error: errorMsg,
      },
      { style, position, duration: MESSAGE_DURATION_MS },
    ),
};
