import { useState } from "react";

const MensualRB = () => {
  const C = {
    bg:"#060609", s1:"#0e0e14", s2:"#16161f", s3:"#1e1e2a",
    tx:"#e2e2e6", t2:"#9999a8", bd:"#2a2a3a",
    g:"#34D399", y:"#FCD34D", r:"#F87171", p:"#F472B6",
    b:"#60A5FA", o:"#FB923C", v:"#A78BFA", w:"#ffffff",
    mono:"'DM Mono',monospace", sans:"'DM Sans',sans-serif"
  };

  const f = (v) => {
    if(v==null)return"$0";
    const a=Math.abs(v);
    const s=v<0?"-":"";
    if(a>=1e9)return s+"$"+(a/1e9).toFixed(1)+"B";
    if(a>=1e6)return s+"$"+(a/1e6).toFixed(1)+"M";
    if(a>=1e3)return s+"$"+(a/1e3).toFixed(0)+"K";
    return "$"+a.toLocaleString("es-AR");
  };
  const ff = (v) => "$"+(v||0).toLocaleString("es-AR");
  const pct = (v) => ((v||0)*100).toFixed(1)+"%";

  const bx = (extra) => ({
    background:C.s1, border:"1px solid "+C.bd, borderRadius:12, padding:16, ...(extra||{})
  });
  const pillSt = (active, color) => ({
    padding:"6px 14px", borderRadius:20, fontSize:13, fontFamily:C.mono,
    cursor:"pointer", border:"none", background:active?color+"22":"transparent",
    color:active?color:C.t2, borderWidth:1, borderStyle:"solid",
    borderColor:active?color+"44":"transparent"
  });

  const CONCEPTOS = [
    "ALQUILER","GASTO EN IVA","GASTOS REDES Y VS","GASTOS MANTENIMIENTO PERSONAL",
    "PLAN (GRAL)","PLAN 2","PLAN 3","GASTOS SERVICIOS","PROVEEDORES VARIOS",
    "SUELDOS PRODUCCION","SEGURO","GASTOS SUELDOS OP/ADM/GCIA","GASTOS DJ",
    "GASTOS DJ ELECTRONICA","GASTOS EMPLEADOS","CONDIMENTOS","GASTOS VARIOS",
    "GASTOS IMPOSITIVOS/COMISIONES","PUBLICAS SABADO","PUBLICAS VIERNES",
    "PUBLICAS MASTER","COSTO DE MERCADERIA VENDIDA","EDILICIOS",
    "EXTRAORDINARIOS","PMO BBVA","PRODUCCION","ELIAS","FONTANA","ROLDAN"
  ];

  const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  const MESES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const EGRESOS_MES = {
    "ALQUILER": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTO EN IVA": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS REDES Y VS": [13915828,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS MANTENIMIENTO PERSONAL": [1806400,498000,0,0,0,0,0,0,0,0,0,0],
    "PLAN (GRAL)": [0,0,0,0,0,0,0,0,0,0,0,0],
    "PLAN 2": [431167,0,0,0,0,0,0,0,0,0,0,0],
    "PLAN 3": [130109.76,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS SERVICIOS": [5089771.02,906667,0,0,0,0,0,0,0,0,0,0],
    "PROVEEDORES VARIOS": [88600,232125,0,0,0,0,0,0,0,0,0,0],
    "SUELDOS PRODUCCION": [0,0,0,0,0,0,0,0,0,0,0,0],
    "SEGURO": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS SUELDOS OP/ADM/GCIA": [18800000,70000,0,0,0,0,0,0,0,0,0,0],
    "GASTOS DJ": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS DJ ELECTRONICA": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS EMPLEADOS": [0,0,0,0,0,0,0,0,0,0,0,0],
    "CONDIMENTOS": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS VARIOS": [0,0,0,0,0,0,0,0,0,0,0,0],
    "GASTOS IMPOSITIVOS/COMISIONES": [0,0,0,0,0,0,0,0,0,0,0,0],
    "PUBLICAS SABADO": [5500000,0,0,0,0,0,0,0,0,0,0,0],
    "PUBLICAS VIERNES": [0,0,0,0,0,0,0,0,0,0,0,0],
    "PUBLICAS MASTER": [0,0,0,0,0,0,0,0,0,0,0,0],
    "COSTO DE MERCADERIA VENDIDA": [0,0,0,0,0,0,0,0,0,0,0,0],
    "EDILICIOS": [308284,5112794,0,0,0,0,0,0,0,0,0,0],
    "EXTRAORDINARIOS": [17036645.07,14200199,0,0,0,0,0,0,0,0,0,0],
    "PMO BBVA": [5760000,5617996.29,0,0,0,0,0,0,0,0,0,0],
    "PRODUCCION": [30000,0,0,0,0,0,0,0,0,0,0,0],
    "ELIAS": [0,0,0,0,0,0,0,0,0,0,0,0],
    "FONTANA": [2000000,0,0,0,0,0,0,0,0,0,0,0],
    "ROLDAN": [0,0,0,0,0,0,0,0,0,0,0,0]
  };

  const INGRESOS_MES = [33751000, 16337343.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const PAGOS0 = [
    {fecha:"2026-01-02",concepto:"PROVEEDORES VARIOS",sub:"Capsulas cafe",monto:14000,mes:"ene"},
    {fecha:"2026-01-02",concepto:"EXTRAORDINARIOS",sub:"Sereno RB",monto:120000,mes:"ene"},
    {fecha:"2026-01-02",concepto:"GASTOS SERVICIOS",sub:"Camara discoteca",monto:220000,mes:"ene"},
    {fecha:"2026-01-04",concepto:"EDILICIOS",sub:"Pintura",monto:21000,mes:"ene"},
    {fecha:"2026-01-04",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Sueldos RB",monto:210000,mes:"ene"},
    {fecha:"2026-01-04",concepto:"PRODUCCION",sub:"Flete",monto:30000,mes:"ene"},
    {fecha:"2026-01-06",concepto:"EXTRAORDINARIOS",sub:"Sereno RB",monto:280000,mes:"ene"},
    {fecha:"2026-01-06",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Hernan",monto:200000,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Sueldos RB",monto:248400,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"HERNAN",monto:200000,mes:"ene"},
    {fecha:"2026-01-12",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"GASTON",monto:50000,mes:"ene"},
    {fecha:"2026-01-31",concepto:"PUBLICAS SABADO",sub:"Sueldo Juan L",monto:3500000,mes:"ene"},
    {fecha:"2026-01-31",concepto:"PUBLICAS SABADO",sub:"Sueldo Toto",monto:2000000,mes:"ene"},
    {fecha:"2026-02-02",concepto:"PROVEEDORES VARIOS",sub:"Farmacia",monto:70125,mes:"feb"},
    {fecha:"2026-02-02",concepto:"PROVEEDORES VARIOS",sub:"Cerrajeria",monto:52000,mes:"feb"},
    {fecha:"2026-02-02",concepto:"EDILICIOS",sub:"Pintura",monto:34400,mes:"feb"},
    {fecha:"2026-02-02",concepto:"EDILICIOS",sub:"Matafuegos",monto:35994,mes:"feb"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"Xavi (municipalidad)",monto:3500000,mes:"feb"},
    {fecha:"2026-02-03",concepto:"GASTOS SERVICIOS",sub:"Aysa",monto:90706,mes:"feb"},
    {fecha:"2026-02-03",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Empleados RB",monto:60000,mes:"feb"},
    {fecha:"2026-02-03",concepto:"GASTOS SERVICIOS",sub:"Camara discoteca",monto:220000,mes:"feb"},
    {fecha:"2026-02-04",concepto:"EXTRAORDINARIOS",sub:"Caja nectar (Flavio)",monto:667500,mes:"feb"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"LUCAS FERNANDEZ",monto:3552000,mes:"feb"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"TARJETA FEDE",monto:1214699,mes:"feb"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"DEVOLUCION LUCAS",monto:1390000,mes:"feb"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"CONSTITUCION SOCIEDAD",monto:3850000,mes:"feb"},
    {fecha:"2026-01-06",concepto:"EXTRAORDINARIOS",sub:"Ba\u00f1os quimicos",monto:3850000,mes:"ene"},
    {fecha:"2026-01-06",concepto:"EXTRAORDINARIOS",sub:"ILUMINACION BLANCO",monto:7500000,mes:"ene"},
    {fecha:"2026-01-03",concepto:"EXTRAORDINARIOS",sub:"TARJETA FEDE",monto:4136645,mes:"ene"},
    {fecha:"2026-01-03",concepto:"EXTRAORDINARIOS",sub:"SUELDOS FIJOS PASTOS",monto:650000,mes:"ene"},
    {fecha:"2026-02-03",concepto:"EXTRAORDINARIOS",sub:"CARGAS SOCIALES LUCAS",monto:26000,mes:"feb"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Santiago",monto:4500000,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Franco",monto:4500000,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Tute",monto:3500000,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Fortu",monto:1500000,mes:"ene"},
    {fecha:"2026-01-15",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"GASTON",monto:1350000,mes:"ene"},
    {fecha:"2026-01-15",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Lucas Longui",monto:1200000,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Cande",monto:1000000,mes:"ene"},
    {fecha:"2026-02-10",concepto:"GASTOS SUELDOS OP/ADM/GCIA",sub:"Hernan",monto:70000,mes:"feb"},
    {fecha:"2026-01-05",concepto:"GASTOS SERVICIOS",sub:"Edenor",monto:2946881,mes:"ene"},
    {fecha:"2026-01-05",concepto:"GASTOS SERVICIOS",sub:"Municipal TSG",monto:1500000,mes:"ene"},
    {fecha:"2026-01-08",concepto:"GASTOS SERVICIOS",sub:"Contador libro de actas",monto:215000,mes:"ene"},
    {fecha:"2026-01-08",concepto:"GASTOS SERVICIOS",sub:"Emerlife",monto:86100,mes:"ene"},
    {fecha:"2026-01-08",concepto:"GASTOS SERVICIOS",sub:"Honorarios abogado",monto:81790,mes:"ene"},
    {fecha:"2026-01-08",concepto:"GASTOS SERVICIOS",sub:"Empleada de limpieza",monto:40000,mes:"ene"},
    {fecha:"2026-02-10",concepto:"GASTOS SERVICIOS",sub:"Internet",monto:595961,mes:"feb"},
    {fecha:"2026-01-05",concepto:"GASTOS REDES Y VS",sub:"SUELDOS REDES RB",monto:13915828,mes:"ene"},
    {fecha:"2026-01-10",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Sueldos RB",monto:660000,mes:"ene"},
    {fecha:"2026-01-15",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Sueldos RB",monto:540000,mes:"ene"},
    {fecha:"2026-01-20",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"Extras Runner RB",monto:28000,mes:"ene"},
    {fecha:"2026-02-06",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"SUELDOS RB",monto:282000,mes:"feb"},
    {fecha:"2026-02-12",concepto:"GASTOS MANTENIMIENTO PERSONAL",sub:"SUELDOS RB",monto:151000,mes:"feb"},
    {fecha:"2026-01-05",concepto:"EDILICIOS",sub:"Carretilla",monto:113000,mes:"ene"},
    {fecha:"2026-01-05",concepto:"EDILICIOS",sub:"Pintura",monto:101100,mes:"ene"},
    {fecha:"2026-02-06",concepto:"EDILICIOS",sub:"ARREGLOS RB",monto:5000000,mes:"feb"},
    {fecha:"2026-02-07",concepto:"EDILICIOS",sub:"PINTURA 7/2",monto:42400,mes:"feb"},
    {fecha:"2026-02-02",concepto:"PROVEEDORES VARIOS",sub:"CAMARAS",monto:110000,mes:"feb"},
    {fecha:"2026-01-05",concepto:"PROVEEDORES VARIOS",sub:"Jardinero",monto:40000,mes:"ene"},
    {fecha:"2026-01-05",concepto:"PROVEEDORES VARIOS",sub:"Papelera",monto:34600,mes:"ene"},
    {fecha:"2026-01-10",concepto:"FONTANA",sub:"TRANSFERENCIA 15/1",monto:1000000,mes:"ene"},
    {fecha:"2026-01-27",concepto:"FONTANA",sub:"TRANSFERENCIA 27/1",monto:1000000,mes:"ene"},
    {fecha:"2026-01-05",concepto:"PMO BBVA",sub:"Prestamo BBVA",monto:5760000,mes:"ene"},
    {fecha:"2026-02-05",concepto:"PMO BBVA",sub:"PMO BBVA",monto:5617996,mes:"feb"},
    {fecha:"2026-01-05",concepto:"PLAN 2",sub:"PLAN 2",monto:431167,mes:"ene"},
    {fecha:"2026-01-05",concepto:"PLAN 3",sub:"PLAN 3",monto:130110,mes:"ene"},
    {fecha:"2026-01-01",concepto:"PUBLICAS MASTER",sub:"Master 13/12",monto:599000,mes:"ene"},
    {fecha:"2026-01-01",concepto:"PUBLICAS MASTER",sub:"Restante Master 13/12",monto:480000,mes:"ene"}
  ];

  const INGRESOS0 = [
    {fecha:"2026-01-31",concepto:"VTA DE MERCADERIA",sub:"MENSUAL",monto:33751000,mes:"ene"},
    {fecha:"2026-02-06",concepto:"VENTA DE MERCADERIA",sub:"BRANCA",monto:5400000,mes:"feb"},
    {fecha:"2026-02-05",concepto:"VENTA DE MERCADERIA",sub:"MILLER",monto:7937343.4,mes:"feb"},
    {fecha:"2026-02-12",concepto:"VENTA DE MERCADERIA",sub:"",monto:3000000,mes:"feb"}
  ];

  /* Sub-conceptos con desglose mensual (de hojas H_) */
  const SUBS = {
    "GASTOS SERVICIOS": [
      {n:"Edenor",m:[2946881,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Municipal TSG",m:[1500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Internet",m:[0,595961,0,0,0,0,0,0,0,0,0,0]},
      {n:"C\u00e1mara Discoteca",m:[220000,220000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Contador libro de actas",m:[215000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Aysa",m:[0,90706,0,0,0,0,0,0,0,0,0,0]},
      {n:"Emerlife",m:[86100,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Honorarios abogado",m:[81790,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Empleada de limpieza",m:[40000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Adt",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Ambulancia",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Bomberos",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Asesoria Pablo",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Cashless",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Facturante",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Fumigaci\u00f3n",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Municipal Seg e Hig",m:[0,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "GASTOS SUELDOS OP/ADM/GCIA": [
      {n:"Santiago",m:[4500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Franco",m:[4500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Tute",m:[3500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Gaston",m:[1800000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Fortu",m:[1500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Lucas Longui",m:[1200000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Cande",m:[1000000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Hernan",m:[800000,70000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Lucas",m:[0,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PROVEEDORES VARIOS": [
      {n:"CAMARAS",m:[0,110000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Farmacia",m:[0,70125,0,0,0,0,0,0,0,0,0,0]},
      {n:"Cerrajeria",m:[0,52000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Jardinero",m:[40000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Papelera",m:[34600,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Capsulas cafe",m:[14000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Bengalas",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Hielo",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Insumos barra",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Lavanderia",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Art\u00edculos limpieza",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Gr\u00e1fica",m:[0,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "GASTOS IMPOSITIVOS/COMISIONES": [
      {n:"MERCADOPAGO",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"IMPUESTOS BBVA",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"IIBB ARBA",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"AFIP CARGAS SOCIALES",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Mantenimiento BANCO",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"AFIP GCIAS",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"PLANES AFIP",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"MUNICIPAL",m:[0,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "EDILICIOS": [
      {n:"ARREGLOS RB",m:[0,5000000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Carretilla",m:[113000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Pintura",m:[101100,34400,0,0,0,0,0,0,0,0,0,0]},
      {n:"PINTURA 7/2",m:[0,42400,0,0,0,0,0,0,0,0,0,0]},
      {n:"Matafuegos",m:[0,35994,0,0,0,0,0,0,0,0,0,0]},
      {n:"Rodillo (corralon)",m:[0,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Corralon",m:[0,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "EXTRAORDINARIOS": [
      {n:"ILUMINACION BLANCO",m:[7500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"TARJETA FEDE",m:[4136645,1214699,0,0,0,0,0,0,0,0,0,0]},
      {n:"Ba\u00f1os quimicos",m:[3850000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"CONSTITUCION SOCIEDAD",m:[0,3850000,0,0,0,0,0,0,0,0,0,0]},
      {n:"LUCAS FERNANDEZ",m:[0,3552000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Xavi (municipalidad)",m:[0,3500000,0,0,0,0,0,0,0,0,0,0]},
      {n:"DEVOLUCION LUCAS",m:[0,1390000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Caja nectar (Flavio)",m:[0,667500,0,0,0,0,0,0,0,0,0,0]},
      {n:"SUELDOS FIJOS PASTOS",m:[650000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Sereno RB",m:[400000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"CARGAS SOCIALES LUCAS",m:[0,26000,0,0,0,0,0,0,0,0,0,0]}
    ],
    "GASTOS MANTENIMIENTO PERSONAL": [
      {n:"Sueldos RB",m:[1658400,438000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Sueldo Dillan RB",m:[120000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Empleados RB",m:[0,60000,0,0,0,0,0,0,0,0,0,0]},
      {n:"Extras Runner RB",m:[28000,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PUBLICAS SABADO": [
      {n:"Sueldo Juan L",m:[3500000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Sueldo Toto",m:[2000000,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PUBLICAS MASTER": [
      {n:"Master 13/12",m:[599000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"Restante Master 13/12",m:[480000,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "GASTOS REDES Y VS": [
      {n:"SUELDOS REDES RB",m:[13915828,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PMO BBVA": [
      {n:"Prestamo BBVA",m:[5760000,5617996,0,0,0,0,0,0,0,0,0,0]}
    ],
    "FONTANA": [
      {n:"TRANSFERENCIA 15/1",m:[1000000,0,0,0,0,0,0,0,0,0,0,0]},
      {n:"TRANSFERENCIA 27/1",m:[1000000,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PRODUCCION": [
      {n:"Flete",m:[30000,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PLAN 2": [
      {n:"PLAN 2",m:[431167,0,0,0,0,0,0,0,0,0,0,0]}
    ],
    "PLAN 3": [
      {n:"PLAN 3",m:[130110,0,0,0,0,0,0,0,0,0,0,0]}
    ]
  };

  const [tab, setTab] = useState(0);
  const [mesPrincipal, setMesPrincipal] = useState(0);
  const [concepto, setConcepto] = useState(CONCEPTOS[0]);
  const [mes1, setMes1] = useState(0);
  const [mes2, setMes2] = useState(1);

  // Helpers
  const getMonthEgresos = (mesIdx) => {
    let total = 0;
    for(let concept of CONCEPTOS) {
      total += EGRESOS_MES[concept][mesIdx] || 0;
    }
    return total;
  };

  const getMonthIngresos = (mesIdx) => INGRESOS_MES[mesIdx] || 0;

  const getMonthResultado = (mesIdx) => getMonthIngresos(mesIdx) - getMonthEgresos(mesIdx);

  const getTotalAnualEgresos = () => {
    let total = 0;
    for(let i=0; i<12; i++) total += getMonthEgresos(i);
    return total;
  };

  const getTotalAnualIngresos = () => {
    let total = 0;
    for(let i=0; i<12; i++) total += getMonthIngresos(i);
    return total;
  };

  const getPagosForMonth = (mesKey) => PAGOS0.filter(p => p.mes === mesKey).sort((a,b) => b.monto - a.monto);

  const getIngresosForMonth = (mesKey) => INGRESOS0.filter(i => i.mes === mesKey);

  const getConceptoForMonth = (concept, mesIdx) => EGRESOS_MES[concept][mesIdx] || 0;

  const getTotalConceptoAnual = (concept) => {
    let total = 0;
    for(let i=0; i<12; i++) total += getConceptoForMonth(concept, i);
    return total;
  };

  const getConceptosWithData = () => {
    return CONCEPTOS.filter(c => getTotalConceptoAnual(c) > 0);
  };

  const mesActivos = (concept) => {
    let count = 0;
    for(let i=0; i<12; i++) if(getConceptoForMonth(concept, i) > 0) count++;
    return count;
  };

  // Micro components
  const Stat = ({label, value, color, sub}) => (
    <div style={{...bx(), flex:1, minWidth:200}}>
      <div style={{fontSize:12, color:C.t2, fontFamily:C.mono, marginBottom:8}}>{label}</div>
      <div style={{fontSize:22, fontWeight:"bold", color:color||C.tx, fontFamily:C.mono, marginBottom:sub?8:0}}>{value}</div>
      {sub && <div style={{fontSize:11, color:C.t2, fontFamily:C.mono}}>{sub}</div>}
    </div>
  );

  const Bar = ({items, maxVal}) => {
    const h = 200;
    const w = 40;
    const gap = 12;
    const maxV = maxVal || Math.max(...items.map(i => i.v), 1);
    return (
      <div style={{display:"flex", alignItems:"flex-end", gap:gap, height:h+40, overflow:"auto", padding:16}}>
        {items.map((item,i) => (
          <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", minWidth:w+gap}}>
            <div style={{
              width:w, height:(item.v/maxV)*h, background:item.c, borderRadius:6,
              transition:"all 0.3s", cursor:"pointer"
            }} title={f(item.v)}></div>
            <div style={{fontSize:10, color:C.t2, marginTop:8, fontFamily:C.mono, textAlign:"center", width:w}}>{item.l}</div>
          </div>
        ))}
      </div>
    );
  };

  const Table = ({headers, rows}) => (
    <div style={{overflowX:"auto", ...bx()}}>
      <table style={{width:"100%", borderCollapse:"collapse", fontFamily:C.mono, fontSize:13}}>
        <thead>
          <tr style={{borderBottom:"1px solid "+C.bd}}>
            {headers.map((h,i) => (
              <th key={i} style={{padding:12, textAlign:"left", color:C.t2}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i) => (
            <tr key={i} style={{borderBottom:"1px solid "+C.bd, cursor:row.onClick?"pointer":"default"}} onClick={row.onClick}>
              {row.cells.map((cell,j) => (
                <td key={j} style={{padding:12, color:cell.color||C.tx}}>{cell.value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Tab 0: 12 Meses
  const Tab12M = () => {
    const totalIngresos = getTotalAnualIngresos();
    const totalEgresos = getTotalAnualEgresos();
    const resultado = totalIngresos - totalEgresos;
    const margen = totalIngresos > 0 ? resultado / totalIngresos : 0;

    const resultados = [];
    for(let i=0; i<12; i++) resultados.push(getMonthResultado(i));

    const positivos = resultados.filter(r => r > 0);
    const bestMonth = positivos.length > 0 ? resultados.indexOf(Math.max(...positivos)) : 0;
    const worstMonth = resultados.indexOf(Math.min(...resultados));
    const monthsWithData = resultados.filter(r => r > 0).length;
    const avgMonth = resultados.reduce((a,b) => a+b, 0) / 12;

    const topConceptos = CONCEPTOS.map(c => ({name:c, total:getTotalConceptoAnual(c)}))
      .filter(c => c.total > 0)
      .sort((a,b) => b.total - a.total)
      .slice(0, 5);

    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label="Ingresos Total Anual" value={f(totalIngresos)} color={C.g} />
          <Stat label="Egresos Total Anual" value={f(totalEgresos)} color={C.r} />
          <Stat label="Resultado Anual" value={f(resultado)} color={resultado>=0?C.g:C.r} />
          <Stat label="Margen %" value={pct(margen)} color={margen>=0?C.g:C.r} />
        </div>

        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label="Mejor Mes" value={bestMonth>=0?MESES[bestMonth]:"-"} color={C.b} sub={bestMonth>=0?f(resultados[bestMonth]):""} />
          <Stat label="Peor Mes" value={MESES[worstMonth]} color={C.o} sub={f(resultados[worstMonth])} />
          <Stat label="Meses con Data" value={monthsWithData.toString()} color={C.p} />
          <Stat label="Promedio Mensual" value={f(avgMonth)} color={C.v} />
        </div>

        <div style={{...bx()}}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Resultado por Mes</h3>
          <Bar items={MESES.map((m,i) => ({l:m, v:resultados[i], c:resultados[i]>=0?C.g:C.r}))} />
        </div>

        <Table headers={["Mes","Ingresos","Egresos","Resultado","Margen"]} rows={MESES.map((m,i) => ({
          cells:[
            {value:m}, {value:f(getMonthIngresos(i))}, {value:f(getMonthEgresos(i))},
            {value:f(resultados[i]), color:resultados[i]>=0?C.g:C.r},
            {value:pct(getMonthIngresos(i)>0?resultados[i]/getMonthIngresos(i):0), color:getMonthIngresos(i)>0&&resultados[i]/getMonthIngresos(i)>=0?C.g:C.r}
          ],
          onClick: () => { setMesPrincipal(i); setTab(1); }
        }))} />

        <div style={{...bx()}}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Top 5 Conceptos de Gasto</h3>
          <Bar items={topConceptos.map(c => ({l:c.name.substring(0,12), v:c.total, c:C.y}))} />
        </div>
      </div>
    );
  };

  // Tab 1: Detalle Mes
  const TabDetalleMes = () => {
    const ing = getMonthIngresos(mesPrincipal);
    const egr = getMonthEgresos(mesPrincipal);
    const res = ing - egr;
    const mar = ing > 0 ? res / ing : 0;
    const mesKey = MESES[mesPrincipal].toLowerCase();
    const pagos = getPagosForMonth(mesKey);
    const ingresos = getIngresosForMonth(mesKey);

    const conceptosData = [];
    for(let c of CONCEPTOS) {
      const amt = getConceptoForMonth(c, mesPrincipal);
      if(amt > 0) conceptosData.push({name:c, val:amt});
    }
    conceptosData.sort((a,b) => b.val - a.val);

    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {MESES.map((m,i) => (
            <button key={i} style={{...pillSt(i===mesPrincipal, C.b)}} onClick={() => setMesPrincipal(i)}>
              {m}
            </button>
          ))}
        </div>

        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label={MESES_FULL[mesPrincipal]} value={""} color={C.tx} />
          <Stat label="Ingresos" value={f(ing)} color={C.g} />
          <Stat label="Egresos" value={f(egr)} color={C.r} />
          <Stat label="Resultado" value={f(res)} color={res>=0?C.g:C.r} sub={pct(mar)} />
        </div>

        {ingresos.length > 0 && (
          <div style={{...bx()}}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>Ingresos</h3>
            {ingresos.map((item,i) => (
              <div key={i} style={{display:"flex", justifyContent:"space-between", padding:8, borderBottom:"1px solid "+C.bd, fontSize:13, fontFamily:C.mono}}>
                <div>{item.sub}</div>
                <div style={{color:C.g}}>{f(item.monto)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{...bx()}}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Egresos por Concepto</h3>
          <Bar items={conceptosData.map(c => ({l:c.name.substring(0,12), v:c.val, c:C.o}))} />
        </div>

        {pagos.length > 0 && (
          <Table headers={["Fecha","Concepto","Detalle","Monto"]} rows={pagos.map(p => ({
            cells:[{value:p.fecha},{value:p.concepto},{value:p.sub},{value:f(p.monto), color:C.r}]
          }))} />
        )}
      </div>
    );
  };

  // Tab 2: Conceptos
  const TabConceptos = () => {
    const conceptosDisp = getConceptosWithData();
    const totalAnual = getTotalConceptoAnual(concepto);
    const promMes = totalAnual / 12;
    const totalEgr = getTotalAnualEgresos();
    const pctTotal = totalEgr > 0 ? totalAnual / totalEgr : 0;
    const mesesAct = mesActivos(concepto);

    const pagosConcepto = PAGOS0.filter(p => p.concepto === concepto).sort((a,b) => b.monto - a.monto);

    const mesData = [];
    for(let i=0; i<12; i++) {
      mesData.push({l:MESES[i], v:getConceptoForMonth(concepto, i)});
    }

    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:6, flexWrap:"wrap", maxHeight:120, overflowY:"auto"}}>
          {conceptosDisp.map((c,i) => (
            <button key={i} style={{...pillSt(c===concepto, C.v)}} onClick={() => setConcepto(c)}>
              {c.substring(0,16)}
            </button>
          ))}
        </div>

        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <Stat label="Total Anual" value={f(totalAnual)} color={C.r} />
          <Stat label="Promedio Mensual" value={f(promMes)} color={C.o} />
          <Stat label="% del Total Egresos" value={pct(pctTotal)} color={C.y} />
          <Stat label="Meses Activos" value={mesesAct.toString()} color={C.b} />
        </div>

        <div style={{...bx()}}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Evolución Anual</h3>
          <Bar items={mesData.map(m => ({l:m.l, v:m.v, c:C.p}))} />
        </div>

        {SUBS[concepto] && SUBS[concepto].length > 0 && (
          <div style={{...bx()}}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Desglose por Sub-concepto</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%", borderCollapse:"collapse", fontFamily:C.mono, fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:"1px solid "+C.bd}}>
                    <th style={{padding:10, textAlign:"left", color:C.t2, minWidth:140}}>Sub-concepto</th>
                    {MESES.map((m,i) => (
                      <th key={i} style={{padding:10, textAlign:"right", color:C.t2, minWidth:65}}>{m}</th>
                    ))}
                    <th style={{padding:10, textAlign:"right", color:C.y, minWidth:80}}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBS[concepto].filter(s => s.m.some(v => v > 0)).sort((a,b) => b.m.reduce((x,y)=>x+y,0) - a.m.reduce((x,y)=>x+y,0)).map((sub,i) => {
                    const total = sub.m.reduce((a,b)=>a+b,0);
                    return (
                      <tr key={i} style={{borderBottom:"1px solid "+C.bd+"44"}}>
                        <td style={{padding:10, color:C.tx}}>{sub.n}</td>
                        {sub.m.map((v,j) => (
                          <td key={j} style={{padding:10, textAlign:"right", color:v>0?C.o:C.t2+"44"}}>{v>0?f(v):"-"}</td>
                        ))}
                        <td style={{padding:10, textAlign:"right", color:C.y, fontWeight:"bold"}}>{f(total)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{borderTop:"2px solid "+C.bd}}>
                    <td style={{padding:10, color:C.w, fontWeight:"bold"}}>TOTAL</td>
                    {Array.from({length:12},(_, i)=>{
                      const colTotal = SUBS[concepto].reduce((s,sub)=>s+(sub.m[i]||0),0);
                      return <td key={i} style={{padding:10, textAlign:"right", color:colTotal>0?C.r:C.t2+"44", fontWeight:"bold"}}>{colTotal>0?f(colTotal):"-"}</td>;
                    })}
                    <td style={{padding:10, textAlign:"right", color:C.r, fontWeight:"bold"}}>{f(SUBS[concepto].reduce((s,sub)=>s+sub.m.reduce((a,b)=>a+b,0),0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagosConcepto.length > 0 && (
          <Table headers={["Fecha","Detalle","Monto"]} rows={pagosConcepto.map(p => ({
            cells:[{value:p.fecha},{value:p.sub},{value:f(p.monto), color:C.r}]
          }))} />
        )}
      </div>
    );
  };

  // Tab 3: Comparar
  const TabComparar = () => {
    const ing1 = getMonthIngresos(mes1);
    const egr1 = getMonthEgresos(mes1);
    const res1 = ing1 - egr1;

    const ing2 = getMonthIngresos(mes2);
    const egr2 = getMonthEgresos(mes2);
    const res2 = ing2 - egr2;

    const conceptosData = [];
    for(let c of CONCEPTOS) {
      const v1 = getConceptoForMonth(c, mes1);
      const v2 = getConceptoForMonth(c, mes2);
      if(v1 > 0 || v2 > 0) {
        conceptosData.push({
          name: c,
          m1: v1,
          m2: v2,
          delta: v2 - v1
        });
      }
    }
    conceptosData.sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));

    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <div style={{display:"flex", gap:16}}>
          <div style={{flex:1}}>
            <label style={{color:C.t2, fontSize:12, fontFamily:C.mono}}>Mes 1</label>
            <select value={mes1} onChange={e => setMes1(parseInt(e.target.value))} style={{width:"100%", padding:8, borderRadius:6, background:C.s1, color:C.tx, border:"1px solid "+C.bd, fontFamily:C.mono, marginTop:4}}>
              {MESES.map((m,i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{color:C.t2, fontSize:12, fontFamily:C.mono}}>Mes 2</label>
            <select value={mes2} onChange={e => setMes2(parseInt(e.target.value))} style={{width:"100%", padding:8, borderRadius:6, background:C.s1, color:C.tx, border:"1px solid "+C.bd, fontFamily:C.mono, marginTop:4}}>
              {MESES.map((m,i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        <div style={{display:"flex", gap:12}}>
          <div style={{flex:1, ...bx()}}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>{MESES[mes1]}</h3>
            <div style={{display:"flex", flexDirection:"column", gap:8, fontFamily:C.mono, fontSize:13}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span>Ingresos:</span><span style={{color:C.g}}>{f(ing1)}</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span>Egresos:</span><span style={{color:C.r}}>{f(egr1)}</span></div>
              <div style={{display:"flex", justifyContent:"space-between", borderTop:"1px solid "+C.bd, paddingTop:8}}><span>Resultado:</span><span style={{color:res1>=0?C.g:C.r}}>{f(res1)}</span></div>
            </div>
          </div>

          <div style={{flex:1, ...bx()}}>
            <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 12px 0"}}>{MESES[mes2]}</h3>
            <div style={{display:"flex", flexDirection:"column", gap:8, fontFamily:C.mono, fontSize:13}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span>Ingresos:</span><span style={{color:C.g}}>{f(ing2)}</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span>Egresos:</span><span style={{color:C.r}}>{f(egr2)}</span></div>
              <div style={{display:"flex", justifyContent:"space-between", borderTop:"1px solid "+C.bd, paddingTop:8}}><span>Resultado:</span><span style={{color:res2>=0?C.g:C.r}}>{f(res2)}</span></div>
            </div>
          </div>
        </div>

        <Table headers={["Concepto",MESES[mes1],MESES[mes2],"Delta"]} rows={conceptosData.map(c => ({
          cells:[
            {value:c.name},
            {value:f(c.m1)},
            {value:f(c.m2)},
            {value:f(c.delta), color:c.delta>0?C.r:C.g}
          ]
        }))} />
      </div>
    );
  };

  // Tab 4: Cash Flow
  const TabCashFlow = () => {
    let acum = 0;
    const data = [];
    for(let i=0; i<12; i++) {
      const ing = getMonthIngresos(i);
      const egr = getMonthEgresos(i);
      const neto = ing - egr;
      acum += neto;
      data.push({mes:MESES[i], ing, egr, neto, acum});
    }

    const minAcum = Math.min(...data.map(d => d.acum));

    return (
      <div style={{display:"flex", flexDirection:"column", gap:16}}>
        <Table headers={["Mes","Ingresos","Egresos","Neto","Acumulado"]} rows={data.map((d,i) => ({
          cells:[
            {value:d.mes},
            {value:f(d.ing), color:C.g},
            {value:f(d.egr), color:C.r},
            {value:f(d.neto), color:d.neto>=0?C.g:C.r},
            {value:f(d.acum), color:d.acum===minAcum?C.r:(d.acum>=0?C.g:C.o)}
          ]
        }))} />

        <div style={{...bx()}}>
          <h3 style={{color:C.tx, fontFamily:C.sans, margin:"0 0 16px 0"}}>Acumulado por Mes</h3>
          <Bar items={data.map(d => ({l:d.mes, v:d.acum, c:d.acum>=0?C.g:C.r}))} />
        </div>
      </div>
    );
  };

  const renderTab = () => {
    switch(tab) {
      case 0: return <Tab12M />;
      case 1: return <TabDetalleMes />;
      case 2: return <TabConceptos />;
      case 3: return <TabComparar />;
      case 4: return <TabCashFlow />;
      default: return null;
    }
  };

  return (
    <div style={{
      background: C.bg,
      color: C.tx,
      fontFamily: C.sans,
      padding: 24
    }}>
      <div style={{maxWidth:1400, margin:"0 auto"}}>
        {/* Header */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:28, fontWeight:"bold", fontFamily:C.mono}}>ROCA BRUJA</div>
          <div style={{fontSize:12, color:C.t2, fontFamily:C.mono}}>MENSUAL v1.0</div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", gap:8, marginBottom:24, flexWrap:"wrap"}}>
          {["12 Meses","Detalle Mes","Conceptos","Comparar","Cash Flow"].map((label,i) => (
            <button key={i} style={{...pillSt(tab===i, C.v)}} onClick={() => setTab(i)}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default MensualRB;
