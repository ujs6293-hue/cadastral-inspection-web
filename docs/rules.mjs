// General explicit-statement checks, authored without private manuals or samples.
export function checkLines(lines,{width=1000,height=1000,method='AI OCR',native=''}={}){
 const findings=[];const compact=s=>s.replace(/\s+/g,'');
 const box=line=>line.bbox?[line.bbox.x0/width*1000,line.bbox.y0/height*1000,line.bbox.x1/width*1000,line.bbox.y1/height*1000]:null;
 const add=(line,title,reason,basis)=>findings.push({title,observation:line.text,reason,basis,bbox:box(line),method,status:'미검토',reviewer:'',review_reason:''});
 const ratio=/([\d,]+(?:\.\d+)?)\s*[/÷]\s*([\d,]+(?:\.\d+)?)\s*[*×xX]\s*100\s*=\s*([\d,]+(?:\.\d+)?)\s*(?:%|°\s*\/\s*0|[oO0]\s*\/\s*[oO0])/g;
 for(const line of lines){for(const m of line.text.matchAll(ratio)){const [a,b,c]=m.slice(1).map(n=>Number(n.replaceAll(',','')));if(!b)continue;const digits=(m[3].split('.')[1]||'').length;if(Math.abs(a/b*100-c)>.5*10**-digits+.001)add(line,'기재 비율식 불일치 후보',`식의 계산값은 ${(a/b*100).toFixed(4)}%, 표기값은 ${c}%입니다. 인식값과 식을 원본으로 확인하세요.`,'명시된 a / b × 100 = c%의 산술 검산. 법정 허용치를 판단하지 않음.');}
  for(const m of line.text.matchAll(/공차\s*=\s*[±士土]?\s*([\d,]+(?:\.\d+)?)\s*[,，]\s*오차\s*=\s*(-?[\d,]+(?:\.\d+)?)/g)){const [limit,error]=m.slice(1).map(n=>Number(n.replaceAll(',','')));if(Math.abs(error)>limit)add(line,'기재 공차·오차 비교 필요',`기재 오차 절댓값 ${Math.abs(error)}가 기재 공차 ${limit}보다 큽니다. 원본 기재값과 인식값을 확인하세요.`,'도면에 인쇄된 두 수치의 비교. 현행 법령 공차를 자동 적용하지 않음.');}}
 if(compact(native+lines.map(l=>l.text).join('')).includes('전자평판측량')){const line=lines.find(l=>compact(l.text).includes('위성측량'));if(line)add(line,'측량방법 표기 대조 필요','전자평판측량과 위성측량 문구가 함께 인식됐습니다. 실제 관측·계산부와 성과결정방법을 대조하세요. 병기 자체는 오류·위법의 증거가 아닙니다.','인식 문구의 병기 대조. 업무 매뉴얼·현행 법령 근거는 별도 검증 필요.');}
 return findings;
}
