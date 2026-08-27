"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions";

export function FollowButton({
  targetId,
  following,
  signedIn,
}: {
  targetId: string;
  following: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(following);
  const [pending, startTransition] = useTransition();

  const onClick = () => {
    if (!signedIn) return router.push("/login");
    setIsFollowing((v) => !v);
    startTransition(async () => {
      const res = await toggleFollow(targetId);
      if (typeof res?.following === "boolean") setIsFollowing(res.following);
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={pending}
      variant={isFollowing ? "outline" : "default"}
      className="rounded-full font-bold"
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
