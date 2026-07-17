export function studentInput(form: FormData) {
  const name=String(form.get("name")||"").trim(),parentPhone=String(form.get("parentPhone")||""),studentClass=String(form.get("class")||"").trim(),monthlyFee=Number(form.get("monthlyFee")),joinDate=new Date(String(form.get("joinDate")||""));
  if(!name||name.length>80||!/^\d{10}$/.test(parentPhone)||!studentClass||studentClass.length>50||!Number.isFinite(monthlyFee)||monthlyFee<0||Number.isNaN(joinDate.getTime()))throw new Error("INVALID_STUDENT");
  return {name,parentPhone,class:studentClass,monthlyFee,joinDate};
}
