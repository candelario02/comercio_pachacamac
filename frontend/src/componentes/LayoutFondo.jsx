import React from 'react';
import Navbar from './Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import munipacha from '../assets/imagenes/imageslider/munipacha.jpeg';
import santuariopacha from '../assets/imagenes/imageslider/santuariopacha.jpeg';
import '../estilos/LayoutFondo.css';

const LayoutFondo = ({ children }) => {
    return (
        <div className="layout-wrapper">
            <div className="fondo-slider">
                <Swiper modules={[Autoplay]} slidesPerView={1} autoplay={{ delay: 4000 }} loop>
                    <SwiperSlide><img src={santuariopacha} alt="fondo" /></SwiperSlide>
                    <SwiperSlide><img src={munipacha} alt="fondo" /></SwiperSlide>
                </Swiper>
            </div>
            <Navbar />
            <div className="contenido-dinamico">
                {children}
            </div>
        </div>
    );
};
export default LayoutFondo;
