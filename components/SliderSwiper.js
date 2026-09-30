import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import ResponsiveImage from "./ResponsiveImage";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function SliderSwiper({ media }) {
  return (
    <Swiper
      pagination={{
        type: "fraction",
      }}
      loop={true}
      navigation={true}
      modules={[Pagination, Navigation]}
      className="mySwiper"
    >
      {media.map((item) => (
        <SwiperSlide key={item}>
          <div className="relative w-full aspect-[16/10] bg-slate-100">
            <ResponsiveImage
              src={item}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 48rem"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
