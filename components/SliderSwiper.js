import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

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
          <img src={item} alt="" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
