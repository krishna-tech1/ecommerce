import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React from "react";

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Visit Us",
    subtitle: "Beirut, LB",
    icon: (
      <MapPin className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
    ),
  },
  {
    title: "Call Us",
    subtitle: "+961 70 860 312",
    icon: (
      <Phone className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
    ),
  },
  {
    title: "Working Hours",
    subtitle: "Mon - Sat: 10:00 AM - 7:00 PM",
    icon: (
      <Clock className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
    ),
  },
  {
    title: "Email Us",
    subtitle: "muthukrishnan8733@gmail.com",
    icon: (
      <Mail className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
    ),
  },
];

const FooterTop = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-b border-slate-800">
      {data?.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-4 group hover:bg-slate-800/40 p-4 rounded-xl transition-all duration-300"
        >
          <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-emerald-950 transition-colors duration-300">
            {item?.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors duration-200">
              {item?.title}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 group-hover:text-slate-300 transition-colors duration-200">
              {item?.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FooterTop;
/* ... */
