// @dev: Don't forget to remove the @ts-nocheck comment when you start using.
// @ts-nocheck

import { GetServerSidePropsContext } from "next";
import { useCreateQueue } from "wagmi-bitkubnext-connector";
import { bitkubnextCaller } from "../_app";

type CallBackProps = {
  approvalToken: string;
};

const CallBackPage = ({ approvalToken }: CallBackProps) => {
  useCreateQueue(bitkubnextCaller, approvalToken);
  return (
    <div>
      <p>Sending Transaction...</p>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const query = context.query;

  return {
    props: {
      approvalToken: query.approval_token ?? null,
    },
  };
};

export default CallBackPage;
