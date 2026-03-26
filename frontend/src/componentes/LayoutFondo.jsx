import React from 'react';
import Navbar from './Navbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../estilos/LayoutFondo.css';

const LayoutFondo = ({ children }) => {
    const imagenesSlider = [
       "/img/palaciomunicipalpacha.jpeg",
        "/img/munipacha.jpeg",
        "/img/cerro-pan-de-azucar.jpeg",
        "/img/mirador-turistico-san-miguel.jpeg",
        "/img/munipacilidadmoderna.webp",
         "/img/santuariopacha.jpeg",
        "/img/santuario-arqueologico-pachacamac.jpeg",
        "/img/trabajandoporunbienestar.jpeg"


    ];

    return (
        <div className="layout-wrapper">
            <div className="fondo-slider">
                <Swiper 
                    modules={[Autoplay]} 
                    slidesPerView={1} 
                    autoplay={{ delay: 4000 }} 
                    loop
                >
                    {imagenesSlider.map((ruta, index) => (
                        <SwiperSlide key={index}>
                            <img src={ruta} alt={`fondo-pachacamac-${index}`} />
                        </SwiperSlide>
                    ))}
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