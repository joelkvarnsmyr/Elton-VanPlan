ag skulle villa ha ett stöd för ”besiktning” där man fotar av rost, motor, remmar, allt som avviker på bilen för att få Ai hjälp att planera i rätt ordning och förstå omfattning och att göra saker i rätt ordning. Kan man ha en Ai driven funktion för det?
Tänk dig att vi ska göra något utan en husbesiktningen. Med fuktmätnkng lackskador, läckage och allt.



Tänker också på att kolla av motorn, oljestickan,
Det ska alltså hjälpa när man köpt en bil… så att ägaren själv kan göra en besiktning, antingen för att avgöra om ett köp är rimligt. Eller för ett köp man redan gjort.
Jag tänker att vi måste täcka allt. Så tänk igenom alla scenarier. Och allt som vi kan dokumentera. Lack, rost, motor, fönster, tätningar, lister, elmotorer för tex fönstertorkare
Hur kan vi tänka mer generellt och mer dynamiskt? Jag tänker att vissa saker kan kräva vidare inspektion? tsx att skruva av panel etc... Kan vi tänka "AND/IF" attribut?



BUYERS_GUIDE.md



Modul: AI-Assisted Vehicle Inspection
Version: 1.0 (LT31 Special)

Detta dokument beskriver hur man utför en datadriven besiktning av ett fordon med hjälp av AI-bildanalys. Metoden fungerar både före köp (värdering) och efter köp (statuskoll).

📸 Steg 1: Datainsamling (Instruktioner)

För att AI ska kunna hjälpa dig måste du mata den med rätt data. Gå igenom dessa zoner och ta skarpa bilder (med blixt om det är mörkt).

ZON A: MORDPLATSEN (Motorrummet)

På en VW LT31: Lyft på "Doghouse"-luckan mellan framsätena.

Oljestickan: Dra upp, torka av, dra upp igen. Fota stickan mot vitt papper/trasa.

AI Letar efter: Vatteninblandning (grå/vit smet), metallspån, sotig vs gyllene färg.

Oljepåfyllningslocket (Insidan): Skruva av locket. Fota undersidan av locket.

AI Letar efter: "Majonnäs" (kondens/vatten = trasig topplockspackning).

Kylvätskan: Öppna locket på expansionstanken (KALL MOTOR!). Fota ner i vätskan.

AI Letar efter: Oljefilm (regnbåge), rostfärgat vatten, fel färg (röd vs blå/grön).

Remmar: Fota kamrem (om synlig) och fläktremmar. Zooma in på insidan av remmen.

AI Letar efter: Torrsprickor, fransiga kanter, saknade tänder.

Slangar: Fota kylarslangar och bränsleslangar.

AI Letar efter: Svullnader, sprickor i gummit, vitt pulver (uttorkning).

ZON B: SKELETTET (Underrede & Rost)

Detta avgör om bilen lever eller dör.

Balkarna: Lägg dig under bilen. Fota de längsgående rambalkarna.

AI Letar efter: Hål, "kexig" metall, tjock underredsmassa som spricker (döljer rost).

Karossskarvar (Seams): Fota de vertikala skarvarna på bilens sidor.

AI Letar efter: Bubblor i lacken, rinnande rostvatten.

Hjulhus & Trösklar: Fota kanten där plåten möter plast/gummi.

AI Letar efter: Genomrostning, dåliga lagningar (spackel).

Golvet (Inifrån): Lyft på mattorna i framsätet.

AI Letar efter: Fukt, rost under mattan (vanligt på LT).

ZON C: HUSET (Boendedelen)

Endast relevant om inredning finns.

Hörn & Tak: Fota övre hörn och runt takluckor/fönster.

AI Letar efter: Mörka fläckar (mögel), rinnmärken, svullna skivor.

🤖 Steg 2: AI-Analys (Prompts)

När du har bilderna, ladda upp dem till din AI (t.ex. ChatGPT Plus eller Gemini Advanced) och använd dessa specifika prompts.

Prompt 1: Vätskeanalys (Diagnos)

Ladda upp: Bild på oljesticka + Bild på kylarvätska + Bild på oljelock.

Prompt:
"Du är en erfaren bilmekaniker. Analysera dessa bilder av motorvätskor från en VW LT31 bensinare (1976).

Bedöm oljans skick: Ser du tecken på vatten (emulsion/majonnäs) eller metallspån? Är den bara gammal?

Bedöm kylarvätskan: Ser du tecken på olja i vattnet eller rost?

SLUTSATS: Finns det risk för trasig topplockspackning baserat på detta? Svara JA/NEJ/OSÄKERT."

Prompt 2: Rostanalys (Kostnadskalkyl)

Ladda upp: Bilder på underrede/balkar.

Prompt:
"Analysera rosten på dessa bilder.

Klassificera rosten: Är det ytrost (Slipbar) eller strukturrost (Kräver svetsning)?

Identifiera delen: Är detta en bärande balk eller bara karossplåt?

Estimat: Om jag inte kan svetsa själv, är detta en reparation för 5 000 kr, 20 000 kr eller 50 000 kr?

RÅD: Om jag letar efter ett enkelt projekt, är detta en 'Dealbreaker'?"

Prompt 3: Motorljud (Video)

Ladda upp: Video där motorn startas kall och går på tomgång.

Prompt:
"Lyssna på ljudet från denna motor.

Startförlopp: Tvekar den eller startar den direkt?

Missljud: Hör du rytmiskt tickande (ventilspel), dovt dunkande (vevlager) eller tjutande (remmar)?

Gångkultur: Går den jämnt på alla cylindrar eller misständer den?"

🚨 Steg 3: Beslutsmatris (The Truth Table)

Använd AI:ns svar för att placera bilen i rätt kategori.

Kategori

Kännetecken (AI Findings)

Före Köp (Beslut)

Efter Köp (Task)

🟢 GRÖN

Olja gyllene/svart. Ytrost. Jämn gång.

KÖP!

Boka vanlig service.

🟡 GUL

Olja svart/tjock. Ytrost på balkar. Tickande ljud. Gamla däck.

PRUTA (Dra av 15k).

Skapa Tasks för Mek-fas 1 & 2.

🔴 RÖD

"Majonnäs" i oljan. Olja i kylarvattnet. Hål i bärande balk. Fuktskada i vägg.

SPRING! (Om ej gratis).

Projektet är nu en "Totalrenovering". Stoppa bygget.

🛠 Praktisk Checklista (Ta med till bilen)

[ ] Hushållspapper (för olja)

[ ] Ficklampa (stark!)

[ ] Liten magnet (för att hitta spackel på karossen - fäster ej på spackel)

[ ] Mobiltelefon (fulladdad)

[ ] Denna guide

FULL_SCAN_PROTOCOL.md

Modul: Elton Deep Scan 360°
Omfattning: Total genomlysning av fordonets samtliga system.

Detta protokoll är uppdelat i 6 Zoner. Varje punkt ska dokumenteras med Foto (F), Video (V) eller Ljud (L).

ZON 1: EXTERIÖR & KAROSS ("Skalet")

Mål: Hitta vattenläckage och rostfällor.

1.1 Glas & Sikt

$$$$

Vindruta: Fota hela rutan. Leta efter stenskott, sprickor och "Vintergatan" (massa små repor i motljus). (F)

$$$$

Gummilist Vindruta: Fota hörnen. Är gummit sprucket? Lyfter det från plåten? (Här läcker LT ofta in vatten på säkringsdosan!). (F)

$$$$

Sidorutor & Bakrutor: Kolla efter delaminering (glaset blir mjölkigt i kanterna). (F)

$$$$

Backspeglar: Sprickor i glaset? Är justeringen slapp? (F)

1.2 Tätningar & Gummi

$$$$

Dörrlister: Fota gummilisten runt framdörrar och skjutdörr. Är den hel, mjuk eller fnasig? (F)

$$$$

Fönsterskrap: Listen som ligger mot rutan i dörren. Är den tät eller rinner vatten rakt ner i dörren? (F)

$$$$

Dropplister (Takrännan): Fota hela rännan runt taket. Leta efter sprickor i karosskittet. (F)

1.3 Lack & Yta

$$$$

Lackskick: Fota klarlacksläpp (vanligt på tak), djupa repor och färgskillnader (tidigare krockskada?). (F)

$$$$

Bubblor: Leta efter små bubblor i lacken (särskilt nertill och i skarvar). Detta är rost som kommer inifrån. (F)

$$$$

Spackel-test: Använd en svag kylskåpsmagnet. Fäster den inte? Då är det tjockt med spackel där. Markera området. (F)

1.4 Rost (De dolda fällorna)

$$$$

Hjulhuskanter: Känn med fingrarna på insidan av skärmkanten. Fota. (F)

$$$$

Fotsteg: Lyft på gummimattan vid insteget. Här samlas vatten. (F)

$$$$

Tanka: Öppna tanklocket. Fota plåten runt röret. (F)

$$$$

Batterihyllan: Fota plåten under startbatteriet (ofta sönderfrätt av syra). (F)

ZON 2: MOTORRUM ("Hjärtat")

Lyft på "Doghouse" mellan stolarna.

2.1 Vätskebalans (Kemi)

$$$$

Motorolja: Stickan (Nivå, färg, lukt). Påfyllningslock (Majonnäs?). (F)

$$$$

Kylarvätska: Expansionskärl (Färg, nivå, oljefilm, bubblor vid gång). (F+V)

$$$$

Bromsvätska: Behållaren (Nivå, färg - ska vara ljusgul, ej svart kaffe!). (F)

$$$$

Spolarvätska: Nivå och lukt (mögel?). (F)

2.2 Mekanisk Hälsa

$$$$

Remmar: Fota insidan av fläktrem/kamrem. Leta sprickor/fransar. Känn på spänningen (ska kunna vridas 90 grader). (F+V)

$$$$

Slangar: Kläm på kylarslangar. Är de hårda (bakelit) eller mjuka (svampiga)? Fota sprickor. (F)

$$$$

Läckage: Lys med ficklampa runt ventilkåpan och toppen. Fota fuktiga fläckar (olja/vatten). (F)

$$$$

Förgasare: Fota länkaget. Ser det glappt ut? Luktar det bensin? (F)

2.3 Elmotorer & Komponenter

$$$$

Torkarmotor: Filma torkarna när de går. Går de tungt? Låter motorn ansträngd? (V+L)

$$$$

Spolarpump: Låter den? Kommer det vatten? (L)

$$$$

Kupéfläkt: Kör på alla hastigheter (1-2-3). Lyssna efter "kvitter" (torra lager) eller obalans. (L)

$$$$

Generator: Lyssna med motor igång. Vinande ljud? (Lagerfel). (L)

$$$$

Startmotor: Filma startförloppet. Slår den till distinkt ("Klick-Vroom") eller tvekar den ("Klick...ugh...ugh")? (V+L)

ZON 3: UNDERREDE ("Skelettet")

Kräver ficklampa och oömma kläder.

3.1 Bärande Konstruktion

$$$$

Rambalkar: Fota längsgående balkar. Peta med mejsel. (F)

$$$$

Tvärbalkar: Särskilt de som håller upp golvet. (F)

$$$$

Domkraftsfästen: Är de intryckta eller rostiga? (F)

3.2 Drivlina & Broms

$$$$

Avgassystem: Fota ljuddämpare och rör. Skaka på röret - sitter det fast? (F+V)

$$$$

Kardanaxel: Fota stödlager (gummit på mitten). Är det sprucket? (F)

$$$$

Bromsrör: Fota metallrören. Är de rostiga? (F)

$$$$

Bromsslangar: Böj på gummislangen vid hjulet. Torrsprickor? (F)

$$$$

Däck: Fota mönsterdjup OCH datumkod (DOT, 4 siffror). Fota sidan (torrsprickor). (F)

ZON 4: INTERIÖR ("Kontoret")

4.1 Förarmiljö

$$$$

Instrument: Filma mätarna vid start. Funkar tempmätaren? Tankmätaren? (V)

$$$$

Reglage: Känn på blinkersspak, ljusknapp. Glapp? (V)

$$$$

Värmereglage: Går vajrarna lätt eller sitter de fast? (V)

$$$$

Golv: Lyft på gummimattan fram. Är det blött? (F)

4.2 Dörrar & Fönster

$$$$

Vevmekanism: Veva rutan upp/ner. Går det tungt? "Hugger" det? (Kuggkrans sliten). (V)

$$$$

Dörrhandtag: Fungerar låset? Känns handtaget slappt? (F)

$$$$

Dörrstopp: Knakar det när du öppnar dörren? (Spricka i A-stolpen?). (L)

🤖 AI-ANALYS: "The Deep Scan Prompt"

När du har samlat in materialet, använd denna prompt för att låta AI:n strukturera arbetet.

System Prompt:

"Du är en AI-baserad fordonsinspektör. Jag kommer att ladda upp en serie foton, videoklipp och ljudfiler från en besiktning av en VW LT31 1976.

För varje fil, analysera följande:

Identifiering: Vad tittar/lyssnar vi på? (T.ex. 'Torkarmotor' eller 'Vänster tröskel').

Statusbedömning:

🟢 GRÖN: Funktionell/Kosmetisk anmärkning.

🟡 GUL: Slitet/Påbörjad rost. Bör åtgärdas inom 12 mån.

🔴 RÖD: Defekt/Farligt/Akut risk för följdskador. Åtgärda NU.

AI-Diagnos:

Bild: Ser du rost, sprickor, läckage eller missfärgning?

Ljud: Hörs lagerljud, skrap, vinande eller ojämn gång?

Video: Ser rörelsen trög eller ryckig ut?

Åtgärdsförslag: Skapa en kort 'Task' för problemet (t.ex. 'Smörj torkarmekanism' eller 'Byt ventilkåpspackning')."

Exempel på AI-svar (Ljudfil Kupéfläkt):

Analys: Ljudfilen uppvisar ett högfrekvent, cykliskt gnisslande som ökar med varvtalet.
Diagnos: Torrslagrade glidlager i fläktmotorn.
Status: 🟡 GUL (Irriterande, men ej kritiskt för drift).
Task: Demontera kupéfläkt, rengör och smörj lager med motorolja.

DYNAMIC_INSPECTION_LOGIC.md

Modul: Elton Logic Engine
Koncept: "The Investigation Tree"
Syfte: Att dynamiskt eskalera en inspektion baserat på fynd, utan att förstöra bilen i onödan.

Istället för en statisk lista använder vi logikblock som AI:n navigerar igenom.

1. Konceptet: Invasionsnivåer (Escalation Levels)

Vi delar in inspektionen i tre nivåer för att skydda bilen (och din tid).

Nivå 1: Ytlig (Non-Invasive)

Metod: Titta, Lukta, Lyssna, Känna.

Verktyg: Ficklampa, Mobilkamera.

Risk: Ingen.

Nivå 2: Undersökande (Minor Invasive)

Metod: Peta, lyfta på lister, skrapa, lossa enstaka skruv.

Verktyg: Skruvmejsel, Fuktmätare, Magnet, Plastkil.

Trigger: Endast om Nivå 1 ger misstanke (t.ex. bubbla i lacken).

Nivå 3: Kirurgisk (Major Invasive)

Metod: Demontera paneler, riva upp golv, kapa i plåt.

Verktyg: Hylsnyckelsats, Kofot, Vinkelslip.

Trigger: Endast om Nivå 2 bekräftar allvarligt fel som måste åtgärdas.

2. Logik-strukturen (IF / THEN / TOOL)

Varje inspektionspunkt har attribut för villkorlig logik.

Datamodell för Dynamiska Noder

interface InspectionNode {
id: string;
question: string;         // "Ser du bubblor i lacken?"
level: 1 | 2 | 3;

// Villkorlig uppföljning
triggers: {
condition: string;      // "BUBBLOR_HITTADE"
nextActionId: string;   // Länkar till nästa nod (Nivå 2)
toolRequired?: string;  // "Skruvmejsel"
}[];
}


3. Scenarier för Elton (Beslutsträd)

Här är de specifika logik-kedjorna för vanliga LT31-problem.

Scenario A: Rost i Karossskarvar (The Seam Logic)

[NIVÅ 1] Visuell kontroll

Fråga: Ser du bubblor eller sprickor i den vertikala skarven?

IF: "Nej, slät lack" -> STOPP (Allt ok).

IF: "Ja, bubblor" -> GÅ TILL NIVÅ 2.

[NIVÅ 2] Peta & Skrapa (Triggered)

Verktyg: Liten plattmejsel.

Action: Peta försiktigt på bubblan.

IF: "Hårt motstånd" -> LOGGA: "Ytrost/Lacksläpp" (Prio Låg).

IF: "Mejseln sjunker in / Det frasar" -> GÅ TILL NIVÅ 3.

[NIVÅ 3] Insidan (Triggered)

Verktyg: Plastkil + Skruvdragare.

Action: Demontera inre väggpanel precis bakom skarven.

IF: "Rostig isolering / Blött" -> LOGGA: "Genomrost i karosskarv" (Prio Hög).

Scenario B: Golv & Fukt (The Floor Logic)

[NIVÅ 1] Taktil kontroll

Fråga: Känns golvmattan/trägolvet svampigt eller luktar det "källare"?

IF: "Nej" -> STOPP.

IF: "Ja" -> GÅ TILL NIVÅ 2.

[NIVÅ 2] Mätning & Stickprov (Triggered)

Verktyg: Fuktmätare + Kniv.

Action: Mät fukt. Om högt, lyft på tröskellist/hörn.

IF: "Torrt under list" -> LOGGA: "Ytlig fukt/Spill".

IF: "Blött/Svart trä" -> GÅ TILL NIVÅ 3.

[NIVÅ 3] Riva Golv (Triggered)

Verktyg: Kofot.

Action: Riv upp en sektion av golvet.

Resultat: Fotografera plåten under. Är det hål i golvet?

Scenario C: Motorljud (The Valve Logic)

[NIVÅ 1] Lyssna

Fråga: Hörs ett tickande ljud som följer varvtalet?

IF: "Nej" -> STOPP.

IF: "Ja" -> GÅ TILL NIVÅ 2.

[NIVÅ 2] Lokalisering (Triggered)

Verktyg: Stetoskop (eller lång skruvmejsel mot örat).

Action: Lyssna på ventilkåpan vs motorblocket.

IF: "Ljudet kommer från toppen" -> LOGGA: "Ventilspel behöver justeras".

IF: "Ljudet kommer djupt nerifrån" -> LOGGA: "Vevlager/Ramlager slut" (KRITISKT!).

4. AI-Instruktion för Dynamik

När vi använder AI för att leda inspektionen, ger vi den följande "System Prompt" för att den ska förstå när den ska be dig hämta verktyg.

AI Prompt:
"Du leder en forensisk undersökning av en bil.
Börja alltid med Nivå 1 (Titta/Känn).

Regel för eskalering:
Be ALDRIG användaren skruva isär något (Nivå 3) om du inte först har sett bevis på Nivå 1 eller 2 som motiverar det.

Exempel:
Användare: 'Jag ser en fläck i taket.'
Du: 'Ok (Nivå 1 fynd). Känn på fläcken. Är den fuktig eller torr?' (Nivå 1 fortsättning).
Användare: 'Den är fuktig.'
Du: 'Då eskalerar vi. Hämta en fuktmätare om du har, annars skruva loss handtaget intill för att se bakom panelen.' (Nivå 2)."

5. Matris för "And/If" Attribut

Här definierar vi kombinationer som ändrar diagnosen.

Fynd A (Primär)

Fynd B (Sekundär)

Slutsats (Diagnos)

Prio

Rost på balk

Hårt gods (Peta)

Ytrost

Låg

Rost på balk

Mjukt gods (Peta)

Strukturrost

AKUT

Olja på stickan: Grå

Kylvätska: Låg

Topplockspackning

AKUT

Olja på stickan: Grå

Körsträcka: <1km (Kall)

Kondens (Normalt)

Låg

Blöt golvmatta

Regnat nyligen? Ja

Läckage (List/Ruta)

Medel

Blöt golvmatta

Regnat nyligen? Nej

Läckage (Värmepaket)


Hur detta kan byggas in i appen (Framtidsvision)
Tänk dig en knapp i din app som heter "Ny Inspektion".

Du klickar på "Motorolja".

Kameran öppnas. Du tar en bild.

Appen (via Gemini API) analyserar bilden direkt.

Appen säger: "Varning! Ser ut som vatten i oljan. Skapa Task: 'Byt Topplockspackning' (Prio Hög)?"

Om du klickar "Ja", läggs det automatiskt in i din MASTER_TASK_LIST och blockerar ditt vanlife-bygge tills det är fixat.

Det är så vi går från "Gissning" till "Datadrivet Beslut".