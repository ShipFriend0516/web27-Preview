import useToast from "../useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteQuestionList } from "@/api/question-list/deleteQuestionList";

interface UseDeleteQuestionList {
  page: Number;
  limit: Number;
}

export const useDeleteQuesitonList = ({
  page,
  limit,
}: UseDeleteQuestionList) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { mutate: deleteQuestions } = useMutation({
    mutationFn: deleteQuestionList,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myQuestions", page, limit],
      });
      queryClient.invalidateQueries({
        queryKey: ["scrapQuestions", page, limit],
      });
    },
    onError: () => {
      toast.error("질문지 삭제에 실패했습니다.");
    },
  });

  return deleteQuestions;
};
