export const MODULES = [
  {key:"crm",label:"CRM & Leads",description:"Contacts, pipelines and customer histories",icon:"Users"},
  {key:"bookings",label:"Bookings",description:"Requests, schedules and confirmations",icon:"CalendarDays"},
  {key:"knowledge",label:"Knowledge Base",description:"Approved company information for staff and AI",icon:"BookOpen"},
  {key:"ai",label:"AI Assistants",description:"Business-aware copilots and receptionists",icon:"Bot"},
  {key:"inbox",label:"Omnichannel Inbox",description:"Route customer communications to teams",icon:"Inbox"},
  {key:"automations",label:"Flow Studio",description:"Design triggers, conditions and actions",icon:"Workflow"},
  {key:"analytics",label:"Analytics",description:"Performance and operational reporting",icon:"ChartNoAxesCombined"},
  {key:"inventory",label:"Inventory",description:"Stock, assets and suppliers",icon:"Boxes"},
  {key:"commerce",label:"Orders & Commerce",description:"Catalogs, orders and transactions",icon:"ShoppingBag"},
  {key:"projects",label:"Projects",description:"Jobs, deliverables and project progress",icon:"FolderKanban"},
  {key:"support",label:"Service Desk",description:"Tickets, cases and customer support",icon:"Headset"},
  {key:"hr",label:"People & Teams",description:"Staff units, roles and approvals",icon:"ContactRound"},
  {key:"finance",label:"Finance Ops",description:"Invoices, collections and expense workflows",icon:"Wallet"},
  {key:"marketing",label:"Marketing",description:"Campaign workflows and lead nurture",icon:"Megaphone"},
  {key:"field_service",label:"Field Services",description:"Dispatch, visits and on-site work orders",icon:"MapPin"},
  {key:"education",label:"Education",description:"Learners, courses and enrollment workflows",icon:"GraduationCap"},
  {key:"healthcare",label:"Care Operations",description:"Non-clinical appointments and office workflows",icon:"HeartHandshake"},
  {key:"logistics",label:"Logistics",description:"Shipments, deliveries and tracking workflows",icon:"Truck"},
  {key:"membership",label:"Memberships",description:"Subscriptions, members and recurring engagement",icon:"BadgeCheck"},
  {key:"reports",label:"Custom Reports",description:"Configure organization-specific reports",icon:"FileBarChart"},
] as const;
export type ModuleKey=typeof MODULES[number]["key"];
export const ALL_MODULE_KEYS=MODULES.map(m=>m.key);
export type BusinessTemplate={key:string;name:string;group:string;description:string;modules:ModuleKey[];workflows:string[];entities:string[]};
export const BUSINESS_TEMPLATES:BusinessTemplate[]=[
 {key:"blank",name:"Build from scratch",group:"Universal",description:"Design your own company model without preset restrictions.",modules:["crm","knowledge","ai"],workflows:[],entities:["customer","task"]},
 {key:"services",name:"Professional services",group:"Services",description:"Consulting, agencies, contractors and advisers.",modules:["crm","bookings","knowledge","ai","projects","finance","automations"],workflows:["Lead qualification","Proposal follow-up","Project kickoff"],entities:["client","project","proposal"]},
 {key:"retail",name:"Retail & e-commerce",group:"Retail",description:"Retail outlets, wholesalers and online merchants.",modules:["crm","knowledge","ai","inventory","commerce","analytics","marketing"],workflows:["Order received","Stock alert","Abandoned cart"],entities:["product","order","supplier"]},
 {key:"salon",name:"Salons & wellness",group:"Lifestyle",description:"Beauty salons, barbers, wellness studios and spas.",modules:["crm","bookings","knowledge","ai","inbox","marketing","membership"],workflows:["Booking request","Appointment reminder","Visit follow-up"],entities:["customer","service","appointment"]},
 {key:"automotive",name:"Automotive",group:"Services",description:"Garages, car washes, detailing and fleets.",modules:["crm","bookings","knowledge","ai","inventory","field_service","automations"],workflows:["Service inquiry","Vehicle check-in","Pickup notification"],entities:["vehicle","service_job","customer"]},
 {key:"real_estate",name:"Real estate",group:"Property",description:"Property management, sales and leasing.",modules:["crm","bookings","knowledge","ai","projects","support","analytics"],workflows:["Viewing request","Lease renewal","Maintenance ticket"],entities:["property","unit","tenant_contact"]},
 {key:"restaurant",name:"Food & hospitality",group:"Hospitality",description:"Restaurants, cafes, catering and hotels.",modules:["crm","bookings","knowledge","ai","inbox","inventory","commerce"],workflows:["Reservation request","Catering inquiry","Guest feedback"],entities:["guest","reservation","menu_item"]},
 {key:"health",name:"Healthcare administration",group:"Specialized",description:"Non-clinical reception and operational coordination.",modules:["crm","bookings","knowledge","support","hr","healthcare"],workflows:["Appointment intake","Administrative follow-up"],entities:["service","appointment","case"]},
 {key:"education",name:"Schools & training",group:"Specialized",description:"Training centers, courses and student services.",modules:["crm","knowledge","ai","education","marketing","finance"],workflows:["Enrollment inquiry","Class reminder","Payment follow-up"],entities:["student","course","enrollment"]},
 {key:"logistics",name:"Logistics & delivery",group:"Operations",description:"Delivery firms, freight brokers and courier networks.",modules:["crm","knowledge","logistics","field_service","analytics","automations"],workflows:["Dispatch request","Shipment milestone","Proof of delivery"],entities:["shipment","vehicle","driver"]},
 {key:"construction",name:"Construction & contracting",group:"Operations",description:"General contractors, subcontractors and builders.",modules:["crm","projects","inventory","finance","field_service","hr","reports"],workflows:["Site inspection","Purchase approval","Progress update"],entities:["project","site","contract"]},
 {key:"nonprofit",name:"Nonprofit & associations",group:"Organizations",description:"Member networks, NGOs and community programs.",modules:["crm","membership","projects","knowledge","marketing","reports"],workflows:["Member onboarding","Donation acknowledgment","Program report"],entities:["member","program","event"]},
 {key:"agency",name:"Digital / AI agency",group:"Services",description:"Client services, marketing and AI automation agencies.",modules:["crm","projects","knowledge","ai","automations","marketing","analytics"],workflows:["Sales discovery","Client onboarding","Campaign follow-up"],entities:["client","project","campaign"]},
 {key:"manufacturing",name:"Manufacturing",group:"Operations",description:"Factories, processors and production operators.",modules:["inventory","commerce","projects","hr","logistics","analytics","reports"],workflows:["Production order","Quality review","Stock replenishment"],entities:["product","batch","work_order"]},
 {key:"legal",name:"Legal & accounting",group:"Professional",description:"Legal practices, tax advisors and accounting offices.",modules:["crm","bookings","knowledge","projects","finance","support"],workflows:["Client inquiry","Document request","Case milestone"],entities:["matter","client","document"]},
];
export const BUSINESS_MODELS=[
  {key:"services",label:"Service provider",description:"Deliver services to clients or customers"},
  {key:"products",label:"Products & commerce",description:"Sell physical or digital products"},
  {key:"hybrid",label:"Hybrid business",description:"Mix services, products and subscriptions"},
  {key:"marketplace",label:"Marketplace",description:"Coordinate buyers, sellers or providers"},
  {key:"membership",label:"Subscription / membership",description:"Serve recurring members and subscribers"},
  {key:"nonprofit",label:"Nonprofit / association",description:"Manage members, donors and programs"},
  {key:"custom",label:"Custom / other",description:"Define operations with no preset constraints"},
] as const;
export const LEGAL_STRUCTURES=[
  {key:"independent",label:"Independent company"},
  {key:"multi_branch",label:"Multiple branches"},
  {key:"holding",label:"Holding company"},
  {key:"franchise",label:"Franchise network"},
  {key:"nonprofit",label:"Nonprofit organization"},
  {key:"department",label:"Department / division"},
  {key:"custom",label:"Custom structure"},
] as const;
export const ENTITY_TYPES=["lead","customer","appointment","project","order","product","asset","case","shipment","member","job","event","invoice","course","property","contract","custom"];
export const UNIT_TYPES=["head_office","branch","department","team","subsidiary","franchise","division","location"] as const;
export type CompanyDraft={name:string;industry:string;businessModel:string;legalStructure:string;currency:string;timezone:string;locale:string;modules:ModuleKey[];departments:string[];description:string};
export const DEFAULT_DRAFT:CompanyDraft={name:"",industry:"services",businessModel:"services",legalStructure:"independent",currency:"QAR",timezone:"Asia/Qatar",locale:"en",modules:["crm","bookings","knowledge","ai"],departments:["Operations","Sales & Customer Care"],description:""};
export function fromTemplate(key:string):Partial<CompanyDraft>{
 const item=BUSINESS_TEMPLATES.find(t=>t.key===key);
 if(!item)return {};
 return {industry:key==="blank"?"general":key,modules:[...item.modules],businessModel:key==="retail"?"products":key==="nonprofit"?"nonprofit":"services"};
}
export function uniqueModules(items:readonly string[]):ModuleKey[]{
 const valid=new Set(ALL_MODULE_KEYS);
 return [...new Set(items)].filter((m):m is ModuleKey=>valid.has(m as ModuleKey));
}
