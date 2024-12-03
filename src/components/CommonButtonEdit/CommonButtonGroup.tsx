import { AiTwotoneEdit } from "react-icons/ai";
import { BiLoaderAlt } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";

const CommonButtonGroup = ({
  onEdit,
  onDelete,
  showDeleteLoadingIcon,
}: any) => {
  console.log("showDeleteLoadingIcon", showDeleteLoadingIcon);
  return (
    <div className="flex cursor-pointer items-center space-x-3.5">
      <div onClick={onEdit}>
        <AiTwotoneEdit size={22} />
      </div>
      {showDeleteLoadingIcon ? (
        <div className="animate-spin">
          <BiLoaderAlt size={22} />
        </div>
      ) : (
        <div onClick={onDelete}>
          <MdDeleteOutline size={22} />
        </div>
      )}
    </div>
  );
};

export default CommonButtonGroup;
