import Button from "@components/common/Button";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { IoMdShare } from "react-icons/io";

interface ButtonSectionProps {
  scrapQuestionList: () => void;
  unScrapQuestionList: () => void;
  isScrapped: boolean;
}

const ButtonSection = ({
  scrapQuestionList,
  unScrapQuestionList,
  isScrapped,
}: ButtonSectionProps) => {
  return (
    <div className="flex w-full gap-4 mt-4">
      <Button text="공유하기" type="gray" icon={IoMdShare} onClick={() => {}} />
      <Button
        text={isScrapped ? "스크랩 취소" : "스크랩하기"}
        type={isScrapped ? "gray" : "green"}
        icon={isScrapped ? FaBookmark : FaRegBookmark}
        onClick={isScrapped ? unScrapQuestionList : scrapQuestionList}
      />
    </div>
  );
};

export default ButtonSection;
