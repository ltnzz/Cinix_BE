import dayjs from "dayjs";
import "dayjs/locale/id.js"

dayjs.locale("id");

export const formatDate = (date) => {
    return dayjs(date).format("DD MMMM YY, HH:mm");
};