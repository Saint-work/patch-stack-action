import { Composition } from "remotion";
import { OpenClawForkPromo } from "./OpenClawForkPromo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="OpenClawForkPromo"
      component={OpenClawForkPromo}
      durationInFrames={720}
      fps={30}
      width={1600}
      height={900}
    />
  );
};
