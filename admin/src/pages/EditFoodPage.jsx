import { useParams } from "react-router-dom";
import FoodsPage from "./FoodsPage";
const EditFoodPage = () => {
  const { id } = useParams();
  return <FoodsPage initialMode="edit" initialFoodId={id} />;
};
var stdin_default = EditFoodPage;
export {
  stdin_default as default
};
