from datetime import date, datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.admin import Admin
from app.models.category import Category
from app.models.newspaper import NewspaperEdition
from app.models.article import Article
from app.models.video import Video
from app.models.activity_log import AdminActivityLog
from app.models.advertisement import Advertisement

def get_english_newspaper_html(pub_date: date) -> str:
    formatted_date = pub_date.strftime("%A, %B %d, %Y")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rise ’n’ Shine – English Edition ({formatted_date})</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 30px;
      background-color: #FFFFFF;
      color: #242424;
      line-height: 1.5;
    }}
    .newspaper-container {{
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      border: 1px solid #EEEEEE;
      padding: 35px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    .masthead {{
      text-align: center;
      border-bottom: 3px double #242424;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }}
    .masthead-title {{
      font-size: 54px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #1719D9;
      margin: 0;
    }}
    .masthead-subtitle {{
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-family: sans-serif;
      color: #747474;
      margin-top: 6px;
    }}
    .dateline-bar {{
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #EEEEEE;
      border-bottom: 2px solid #242424;
      padding: 8px 0;
      font-family: sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 25px;
    }}
    .headline-main {{
      font-size: 40px;
      font-weight: 800;
      line-height: 1.15;
      color: #1719D9;
      margin: 0 0 15px 0;
      text-align: center;
    }}
    .subdeck {{
      font-size: 19px;
      font-style: italic;
      color: #555555;
      text-align: center;
      max-width: 850px;
      margin: 0 auto 25px auto;
      line-height: 1.4;
    }}
    .lead-story-grid {{
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-bottom: 35px;
    }}
    .story-body {{
      font-size: 15px;
      text-align: justify;
      column-count: 2;
      column-gap: 25px;
    }}
    .story-body p:first-of-type::first-letter {{
      font-size: 52px;
      float: left;
      line-height: 0.8;
      margin-right: 8px;
      color: #1719D9;
      font-weight: bold;
    }}
    .side-column {{
      border-left: 1px solid #EEEEEE;
      padding-left: 25px;
    }}
    .side-headline {{
      font-size: 20px;
      font-weight: bold;
      color: #242424;
      margin-top: 0;
      margin-bottom: 10px;
    }}
    .editorial-quote {{
      border-top: 2px solid #C6FD04;
      border-bottom: 2px solid #C6FD04;
      padding: 15px 0;
      font-size: 16px;
      font-weight: 600;
      font-style: italic;
      margin: 20px 0;
      color: #14243A;
    }}
    .section-divider {{
      border: 0;
      height: 1px;
      background: #EEEEEE;
      margin: 30px 0;
    }}
    .bottom-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
    }}
    .grid-story h4 {{
      font-size: 18px;
      color: #1719D9;
      margin: 0 0 8px 0;
    }}
    .grid-story p {{
      font-size: 13.5px;
      color: #444444;
      margin: 0;
      text-align: justify;
    }}
    .category-badge {{
      display: inline-block;
      background: #C6FD04;
      color: #242424;
      font-family: sans-serif;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 3px 8px;
      margin-bottom: 8px;
    }}
    .img-placeholder {{
      width: 100%;
      height: 220px;
      background: #FAFAFA;
      border: 1px solid #EEEEEE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      color: #888;
      font-size: 13px;
      margin-bottom: 12px;
    }}
  </style>
</head>
<body>
  <div class="newspaper-container">
    <header class="masthead">
      <h1 class="masthead-title">Rise ’n’ Shine</h1>
      <div class="masthead-subtitle">The AI Newspaper • Independent Global Broadsheet</div>
    </header>

    <div class="dateline-bar">
      <span>Vol. XLVII No. 312</span>
      <span>{formatted_date}</span>
      <span>National & International Edition • Price: ₹5.00</span>
    </div>

    <main>
      <h2 class="headline-main">Global Tech Summit Unveils Next-Generation AI Architecture for Scientific Discovery</h2>
      <div class="subdeck">
        Autonomous computing models simulate molecular biology and climate simulations fifty times faster than conventional supercomputers, heralding an era of automated synthesis.
      </div>

      <div class="lead-story-grid">
        <div class="story-body">
          <p>
            In what researchers describe as an inflection point for autonomous computational science, an international consortium of machine learning engineers and atmospheric scientists published benchmark results demonstrating comprehensive real-time planetary modeling. By fusing high-dimensional neural representations with thermodynamic physical equations, the new hybrid foundation architecture processes multi-decadal meteorological shifts with unprecedented fidelity.
          </p>
          <p>
            The implications reach deeply into pharmaceutical discovery and renewable battery chemistry. Laboratory validation pipelines that previously required quarters of iterative bench testing now generate verified syntheses in mere days. Dr. Elena Vance, principal investigator at the Institute for Advanced Computational Inference, emphasized that autonomous verification mechanisms safeguard against non-physical hallucination, ensuring scientific integrity at every iteration.
          </p>
          <p>
            Regulatory bodies and scientific publishing houses have moved rapidly to ratify standardized evaluation protocols. The consensus framework establishes algorithmic traceability, mandating open disclosure of training seeds and mathematical proofs for synthetic findings before empirical deployment.
          </p>
        </div>

        <div class="side-column">
          <span class="category-badge">Economy & Markets</span>
          <h3 class="side-headline">Global Tech Capital Rebounds as Manufacturing Indices Surge</h3>
          <p style="font-size: 13.5px; text-align: justify; margin-bottom: 15px;">
            Semiconductor foundries reported an 18 percent rise in high-density wafer deliveries this quarter, driven by decentralized inference clusters and commercial edge computing installations across Asia and Europe.
          </p>

          <div class="editorial-quote">
            "The convergence of deterministic scientific principles with generative systems marks the transition from speculative AI to empirical industrial empowerment."
          </div>

          <h4 style="font-family: sans-serif; font-size: 12px; text-transform: uppercase; margin: 15px 0 5px 0; color: #1719D9;">Key Indicators</h4>
          <p style="font-family: sans-serif; font-size: 11px; margin: 0; line-height: 1.6;">
            • High-Performance Compute Index: +3.4%<br>
            • Green Energy Grid Integration: 64.2 GW<br>
            • AI Patent Grants (FY26): +22% YoY
          </p>
        </div>
      </div>

      <hr class="section-divider">

      <div class="bottom-grid">
        <div class="grid-story">
          <span class="category-badge">Education</span>
          <h4>Multilingual AI Literacy Programs Reach 500 Rural Districts</h4>
          <p>
            Curriculum initiatives tailored for local dialects empower students with foundational algorithmic problem solving and computational thinking across state secondary schools.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">Infrastructure</span>
          <h4>Clean Energy Desalination Grid Activated in Coastal Corridors</h4>
          <p>
            Solar-powered reverse osmosis plants commence operations, providing high-efficiency freshwater distribution while offsetting industrial carbon footprints through closed-loop recycling.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">Space Sciences</span>
          <h4>Lunar Deep-Space Communications Relay Achieves First Orbit</h4>
          <p>
            Orbital transmitters establish uninterrupted multi-gigabit laser links between Earth ground stations and far-side robotic surface prospectors.
          </p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>"""

def get_telugu_newspaper_html(pub_date: date) -> str:
    formatted_date = pub_date.strftime("%d %B, %Y")
    return f"""<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="UTF-8">
  <title>రైజ్ ’న్’ షైన్ – తెలుగు దినపత్రిక ({formatted_date})</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Noto Sans Telugu', 'Gautami', 'Pothana2000', sans-serif;
      margin: 0;
      padding: 30px;
      background-color: #FFFFFF;
      color: #242424;
      line-height: 1.6;
    }}
    .newspaper-container {{
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      border: 1px solid #EEEEEE;
      padding: 35px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    .masthead {{
      text-align: center;
      border-bottom: 3px double #1719D9;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }}
    .masthead-title {{
      font-size: 52px;
      font-weight: 900;
      color: #1719D9;
      margin: 0;
    }}
    .masthead-subtitle {{
      font-size: 15px;
      font-weight: 600;
      color: #747474;
      margin-top: 6px;
    }}
    .dateline-bar {{
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #EEEEEE;
      border-bottom: 2px solid #242424;
      padding: 8px 0;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 25px;
    }}
    .headline-main {{
      font-size: 38px;
      font-weight: 800;
      line-height: 1.25;
      color: #1719D9;
      margin: 0 0 15px 0;
      text-align: center;
    }}
    .subdeck {{
      font-size: 18px;
      color: #555555;
      text-align: center;
      max-width: 900px;
      margin: 0 auto 25px auto;
    }}
    .lead-story-grid {{
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-bottom: 35px;
    }}
    .story-body {{
      font-size: 15.5px;
      text-align: justify;
      column-count: 2;
      column-gap: 25px;
    }}
    .story-body p:first-of-type::first-letter {{
      font-size: 46px;
      float: left;
      line-height: 0.8;
      margin-right: 8px;
      color: #1719D9;
      font-weight: bold;
    }}
    .side-column {{
      border-left: 1px solid #EEEEEE;
      padding-left: 25px;
    }}
    .side-headline {{
      font-size: 21px;
      font-weight: bold;
      color: #242424;
      margin-top: 0;
      margin-bottom: 10px;
    }}
    .editorial-quote {{
      border-top: 2px solid #C6FD04;
      border-bottom: 2px solid #C6FD04;
      padding: 15px 0;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
      color: #1719D9;
    }}
    .category-badge {{
      display: inline-block;
      background: #C6FD04;
      color: #242424;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      margin-bottom: 8px;
      border-radius: 2px;
    }}
    .bottom-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      border-top: 1px solid #EEEEEE;
      padding-top: 25px;
    }}
    .grid-story h4 {{
      font-size: 17px;
      color: #1719D9;
      margin: 0 0 8px 0;
    }}
    .grid-story p {{
      font-size: 14px;
      color: #444444;
      margin: 0;
      text-align: justify;
    }}
  </style>
</head>
<body>
  <div class="newspaper-container">
    <header class="masthead">
      <h1 class="masthead-title">రైజ్ ’న్’ షైన్</h1>
      <div class="masthead-subtitle">ది ఏఐ న్యూస్‌పేపర్ • విజ్ఞానమే మన బలం • నిష్పక్షపాత తెలుగు దినపత్రిక</div>
    </header>

    <div class="dateline-bar">
      <span>సంపుటి 1 • సంచిక 184</span>
      <span>{formatted_date}</span>
      <span>హైదరాబాద్ • అమరావతి • విశాఖపట్నం ఎడిషన్ • వెల: ₹5.00</span>
    </div>

    <main>
      <h2 class="headline-main">వ్యవసాయ రంగంలో విప్లవాత్మక ఏఐ సాంకేతికత: రైతన్నలకు నేరుగా శాటిలైట్ సలహాలు</h2>
      <div class="subdeck">
        వాతావరణ మార్పులను ముందే పసిగట్టి దిగుబడులను 30 శాతం వరకు పెంచే ఆధునిక వ్యవస్థ అందుబాటులోకి. తెలుగు రాష్ట్రాల రైతులకు ప్రత్యేక మొబైల్ సేవలు ప్రారంభం.
      </div>

      <div class="lead-story-grid">
        <div class="story-body">
          <p>
            తెలుగు రాష్ట్రాల్లో వ్యవసాయ రంగాన్ని మరింత లాభసాటిగా మార్చేందుకు సరికొత్త కృత్రిమ మేధ (ఏఐ) వ్యవస్థను శాస్త్రవేత్తలు ఆవిష్కరించారు. వాతావరణంలో సంభవించే సూక్ష్మ మార్పులు, నేల స్వభావం, భూగర్భ జలాల లభ్యతను రియల్ టైమ్‌లో విశ్లేషించి రైతులకు వారి మాతృభాషలోనే సలహాలు అందించడం ఈ నూతన సాంకేతికత ప్రధాన ఉద్దేశం.
          </p>
          <p>
            ఇప్పటివరకు పంటలకు సోకే తెగుళ్లను గుర్తించడానికి రోజుల తరబడి సమయం పట్టేది. అయితే కొత్త స్మార్ట్ విజన్ మోడళ్ల సహాయంతో స్మార్ట్‌ఫోన్ ద్వారా ఆకుల ఫోటో తీస్తే చాలు, తెగులు రకం మరియు దానికి అవసరమైన ఖచ్చితమైన మందుల మోతాదును క్షణాల్లో సూచిస్తుంది. దీనివల్ల రసాయన ఎరువుల ఖర్చు గణనీయంగా తగ్గడమే కాకుండా నేల సారం కూడా కాపాడబడుతుంది.
          </p>
          <p>
            ప్రభుత్వ వ్యవసాయ శాఖ మరియు ప్రముఖ పరిశోధనా సంస్థలు సంయుక్తంగా చేపట్టిన ఈ పథకం ద్వారా ఇప్పటికే లక్షలాది మంది రైతులకు ప్రత్యక్ష ప్రయోజనం చేకూరుతోంది. మండల స్థాయిలో ప్రత్యేక శిక్షణా శిబిరాలను ఏర్పాటు చేసి రైతులను సాంకేతికంగా చైతన్యపరుస్తున్నారు.
          </p>
        </div>

        <div class="side-column">
          <span class="category-badge">ఆర్థిక రంగం</span>
          <h3 class="side-headline">ఐటీ ఎగుమతుల్లో తెలుగు రాష్ట్రాల రికార్డు వృద్ధి</h3>
          <p style="font-size: 14px; text-align: justify; margin-bottom: 15px;">
            హైదరాబాద్, విశాఖపట్నం కేంద్రాలుగా నూతన గ్లోబల్ కేపబిలిటీ సెంటర్లు విస్తరిస్తుండటంతో ప్రస్తుత త్రైమాసికంలో టెక్ రంగంలో ఉద్యోగావకాశాలు 24 శాతం పెరిగాయి.
          </p>

          <div class="editorial-quote">
            "ఆధునిక సాంకేతికత గ్రామ స్థాయి వరకు చేరినప్పుడే అసలైన సమగ్ర అభివృద్ధి సాధ్యమవుతుంది."
          </div>

          <h4 style="font-size: 13px; font-weight: bold; color: #1719D9; margin: 15px 0 5px 0;">ముఖ్యాంశాలు</h4>
          <p style="font-size: 12.5px; margin: 0; line-height: 1.6;">
            • సూక్ష్మ సేద్యం ప్రాజెక్టులకు 75% రాయితీ<br>
            • గ్రామీణ ప్రాంతాల్లో హై-స్పీడ్ బ్రాడ్‌బ్యాండ్ సేవలు<br>
            • స్వయం సహాయక సంఘాలకు డిజిటల్ ఫైనాన్స్ శిక్షణ
          </p>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="grid-story">
          <span class="category-badge">విద్యా రంగం</span>
          <h4>పాఠశాలల్లో కోడింగ్ మరియు ఏఐ ప్రాథమిక పాఠాలు</h4>
          <p>
            ప్రభుత్వ ఉన్నత పాఠశాలల్లో విద్యార్థులకు కంప్యూటేషనల్ ఆలోచనను పెంపొందించేందుకు సరికొత్త ప్రాక్టికల్ ల్యాబ్‌లను ఏర్పాటు చేశారు.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">ఆరోగ్యం</span>
          <h4>గ్రామీణ ప్రాంతాల్లో టెలిమెడిసిన్ కేంద్రాల విస్తరణ</h4>
          <p>
            మారుమూల గ్రామాల ప్రజలకు నిపుణులైన వైద్యులతో ప్రత్యక్ష కన్సల్టేషన్ అందించే డిజిటల్ హెల్త్ క్లినిక్‌లు ప్రారంభమయ్యాయి.
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">క్రీడలు</span>
          <h4>జాతీయ క్రీడల్లో మన యువ అథ్లెట్ల ప్రతిభ</h4>
          <p>
            అథ్లెటిక్స్ మరియు బ్యాడ్మింటన్ విభాగాల్లో తెలుగు తేజాలు స్వర్ణ పతకాలను సాధించి జాతీయ స్థాయిలో రికార్డు సృష్టించారు.
          </p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>"""

def get_hindi_newspaper_html(pub_date: date) -> str:
    formatted_date = pub_date.strftime("%d %B, %Y")
    return f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>राइज ’न’ शाइन – हिंदी राष्ट्रीय संस्करण ({formatted_date})</title>
  <style>
    * {{ box-sizing: border-box; }}
    body {{
      font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif;
      margin: 0;
      padding: 30px;
      background-color: #FFFFFF;
      color: #242424;
      line-height: 1.6;
    }}
    .newspaper-container {{
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      border: 1px solid #EEEEEE;
      padding: 35px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    .masthead {{
      text-align: center;
      border-bottom: 3px double #1719D9;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }}
    .masthead-title {{
      font-size: 54px;
      font-weight: 900;
      color: #1719D9;
      margin: 0;
    }}
    .masthead-subtitle {{
      font-size: 15px;
      font-weight: 600;
      color: #747474;
      margin-top: 6px;
    }}
    .dateline-bar {{
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #EEEEEE;
      border-bottom: 2px solid #242424;
      padding: 8px 0;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 25px;
    }}
    .headline-main {{
      font-size: 38px;
      font-weight: 800;
      line-height: 1.25;
      color: #1719D9;
      margin: 0 0 15px 0;
      text-align: center;
    }}
    .subdeck {{
      font-size: 18px;
      color: #555555;
      text-align: center;
      max-width: 900px;
      margin: 0 auto 25px auto;
    }}
    .lead-story-grid {{
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-bottom: 35px;
    }}
    .story-body {{
      font-size: 15.5px;
      text-align: justify;
      column-count: 2;
      column-gap: 25px;
    }}
    .story-body p:first-of-type::first-letter {{
      font-size: 46px;
      float: left;
      line-height: 0.8;
      margin-right: 8px;
      color: #1719D9;
      font-weight: bold;
    }}
    .side-column {{
      border-left: 1px solid #EEEEEE;
      padding-left: 25px;
    }}
    .side-headline {{
      font-size: 21px;
      font-weight: bold;
      color: #242424;
      margin-top: 0;
      margin-bottom: 10px;
    }}
    .editorial-quote {{
      border-top: 2px solid #FFD21A;
      border-bottom: 2px solid #FFD21A;
      padding: 15px 0;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
      color: #1719D9;
    }}
    .category-badge {{
      display: inline-block;
      background: #FFD21A;
      color: #242424;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      margin-bottom: 8px;
      border-radius: 2px;
    }}
    .bottom-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      border-top: 1px solid #EEEEEE;
      padding-top: 25px;
    }}
    .grid-story h4 {{
      font-size: 17px;
      color: #1719D9;
      margin: 0 0 8px 0;
    }}
    .grid-story p {{
      font-size: 14px;
      color: #444444;
      margin: 0;
      text-align: justify;
    }}
  </style>
</head>
<body>
  <div class="newspaper-container">
    <header class="masthead">
      <h1 class="masthead-title">राइज ’न’ शाइन</h1>
      <div class="masthead-subtitle">द एआई न्यूज़पेपर • निष्पक्ष पत्रकारिता • राष्ट्रीय दैनिक संस्करण</div>
    </header>

    <div class="dateline-bar">
      <span>वर्ष 2 • अंक 245</span>
      <span>{formatted_date}</span>
      <span>नई दिल्ली • मुंबई • लखनऊ • मूल्य: ₹5.00</span>
    </div>

    <main>
      <h2 class="headline-main">भारतीय अंतरिक्ष अनुसंधान में ऐतिहासिक छलांग: अगली पीढ़ी के सौर मिशन का सफल प्रक्षेपण</h2>
      <div class="subdeck">
        सौर तूफानों और अंतरिक्ष मौसम के सटीक पूर्वानुमान के लिए स्वदेशी तकनीक से निर्मित वेधशाला ने कक्षा में स्थापित होकर पहला वैज्ञानिक डेटा प्रेषित किया।
      </div>

      <div class="lead-story-grid">
        <div class="story-body">
          <p>
            भारतीय अंतरिक्ष अनुसंधान वैज्ञानिकों ने आज श्रीहरिकोटा से नई पीढ़ी के अत्याधुनिक उपग्रह का सफल प्रक्षेपण कर वैश्विक अंतरिक्ष विज्ञान में एक नया मील का पत्थर स्थापित किया। यह मिशन सौर वायुमंडल की चुंबकीय गतिविधियों और पृथ्वी के संचार तंत्र पर सौर ज्वालाओं के प्रभाव का गहन अध्ययन करेगा।
          </p>
          <p>
            इस अभियान में उपयोग किए गए सभी पेलोड और स्पेक्ट्रोमीटर देश की अग्रणी अनुसंधान प्रयोगशालाओं में विकसित किए गए हैं। उपग्रह में एकीकृत स्वायत्त इमेजिंग सिस्टम सौर तूफानों के घटित होने से कम से कम 24 घंटे पूर्व पृथ्वी के पावर ग्रिड और उपग्रह संचार नेटवर्कों को सतर्क करने में सक्षम है।
          </p>
          <p>
            प्रधानमंत्री और प्रमुख वैज्ञानिकों ने इस ऐतिहासिक उपलब्धि पर पूरी टीम को बधाई दी। उन्होंने कहा कि यह सफलता आत्मनिर्भर भारत के वैज्ञानिक सामर्थ्य और युवाओं की तकनीकी प्रतिभा का प्रत्यक्ष प्रमाण है। अंतरराष्ट्रीय अंतरिक्ष एजेंसियों ने भी इस मिशन के डेटा साझाकरण समझौते का स्वागत किया है।
          </p>
        </div>

        <div class="side-column">
          <span class="category-badge">राष्ट्रीय अर्थव्यवस्था</span>
          <h3 class="side-headline">विनिर्माण क्षेत्र में 14% की जबरदस्त वृद्धि</h3>
          <p style="font-size: 14px; text-align: justify; margin-bottom: 15px;">
            इलेक्ट्रॉनिक्स और हरित ऊर्जा उपकरणों के घरेलू उत्पादन में तेजी से चालू वित्त वर्ष में औद्योगिक उत्पादन सूचकांक ने नए रिकॉर्ड स्तर को छुआ।
          </p>

          <div class="editorial-quote">
            "वैज्ञानिक नवाचार और आर्थिक आत्मनिर्भरता ही आधुनिक भारत के समग्र विकास का सशक्त आधार हैं।"
          </div>

          <h4 style="font-size: 13px; font-weight: bold; color: #1719D9; margin: 15px 0 5px 0;">प्रमुख आंकड़े</h4>
          <p style="font-size: 12.5px; margin: 0; line-height: 1.6;">
            • निर्यात वृद्धि: +11.8% वार्षिक<br>
            • नवीकरणीय ऊर्जा क्षमता: 180 गीगावाट पार<br>
            • सेमीकंडक्टर फैब्रिकेशन संयंत्र निर्माण तीव्र
          </p>
        </div>
      </div>

      <div class="bottom-grid">
        <div class="grid-story">
          <span class="category-badge">शिक्षा एवं कौशल</span>
          <h4>देश भर के तकनीकी संस्थानों में एआई कौशल केंद्र</h4>
          <p>
            इंजीनियरिंग और विज्ञान के छात्रों को अत्याधुनिक कंप्यूटिंग और रोबोटिक्स में दक्ष बनाने के लिए राष्ट्रीय स्तर पर 50 नए उत्कृष्टता केंद्र स्थापित किए जाएंगे।
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">पर्यावरण</span>
          <h4>हिमालयी नदियों के संरक्षण हेतु व्यापक कार्ययोजना</h4>
          <p>
            पर्वतीय जलस्रोतों की निगरानी के लिए डिजिटल सेंसर आधारित नेटवर्क सक्रिय किया गया, जिससे जल प्रदूषण स्तर में त्वरित कमी दर्ज की गई।
          </p>
        </div>

        <div class="grid-story">
          <span class="category-badge">खेल जगत</span>
          <h4>विश्व कप तीरंदाजी में भारत ने जीते तीन स्वर्ण पदक</h4>
          <p>
            युवा तीरंदाजों ने उत्कृष्ट निशानेबाजी का प्रदर्शन करते हुए व्यक्तिगत और टीम स्पर्धाओं में शानदार जीत दर्ज कर देश का गौरव बढ़ाया।
          </p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>"""

def seed_database():
    """Initializes tables and seeds initial administrative and editorial fixtures."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Administrator
        admin_email = "admin@risenshine.com"
        admin = db.query(Admin).filter(Admin.email == admin_email).first()
        if not admin:
            admin = Admin(
                name="Chief Editorial Administrator",
                email=admin_email,
                password_hash=get_password_hash("RiseAdmin@2026!"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"[OK] Seeded Administrator: {admin_email} (Password: RiseAdmin@2026!)")
        else:
            print(f"[INFO] Administrator {admin_email} already exists.")

        # 2. Seed Categories
        categories_data = [
            ("Artificial Intelligence", "artificial-intelligence"),
            ("Technology", "technology"),
            ("National", "national"),
            ("International", "international"),
            ("Business & Economy", "business"),
            ("Education", "education"),
            ("Sports", "sports"),
            ("Entertainment", "entertainment"),
            ("Health & Science", "health-science"),
        ]

        category_map = {}
        for name, slug in categories_data:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(name=name, slug=slug)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            category_map[slug] = cat
        print(f"[OK] Verified {len(categories_data)} editorial categories.")

        # 3. Seed Newspaper Editions for Today & Yesterday
        today = date.today()
        yesterday = today - timedelta(days=1)
        two_days_ago = today - timedelta(days=2)

        editions_to_create = [
            ("Rise ’n’ Shine – English National Edition", "en", today, get_english_newspaper_html(today)),
            ("రైజ్ ’న్’ షైన్ – తెలుగు ప్రధాన సంచిక", "te", today, get_telugu_newspaper_html(today)),
            ("राइज ’न’ शाइन – हिंदी राष्ट्रीय संस्करण", "hi", today, get_hindi_newspaper_html(today)),
            ("Rise ’n’ Shine – English National Edition", "en", yesterday, get_english_newspaper_html(yesterday)),
            ("రైజ్ ’న్’ షైన్ – తెలుగు ప్రధాన సంచిక", "te", yesterday, get_telugu_newspaper_html(yesterday)),
            ("राइज ’न’ शाइन – हिंदी राष्ट्रीय संस्करण", "hi", yesterday, get_hindi_newspaper_html(yesterday)),
            ("Rise ’n’ Shine – English National Edition", "en", two_days_ago, get_english_newspaper_html(two_days_ago)),
        ]

        edition_records = {}
        for title, lang, pub_date, html in editions_to_create:
            existing_ed = db.query(NewspaperEdition).filter(
                NewspaperEdition.language == lang,
                NewspaperEdition.publication_date == pub_date
            ).first()
            if not existing_ed:
                ed = NewspaperEdition(
                    title=f"{title} ({pub_date.strftime('%b %d')})",
                    language=lang,
                    publication_date=pub_date,
                    description=f"Official daily digital edition for {pub_date.isoformat()}",
                    original_filename=f"edition_{lang}_{pub_date.isoformat()}.html",
                    html_content=html,
                    content_size=len(html.encode("utf-8")),
                    status="published",
                    created_by=admin.id,
                    published_at=datetime.now(timezone.utc)
                )
                db.add(ed)
                db.commit()
                db.refresh(ed)
                edition_records[(lang, pub_date)] = ed
            else:
                edition_records[(lang, pub_date)] = existing_ed

        print(f"[OK] Verified published newspaper editions for English, Telugu, and Hindi.")

        # 4. Seed Articles
        articles_data = [
            # English Articles
            {
                "title": "Autonomous Scientific Discovery Systems Accelerate Molecular Biology Research",
                "slug": "autonomous-scientific-discovery-systems-molecular-biology",
                "language": "en",
                "description": "Researchers deploy advanced generative architectures to model biological macromolecules fifty times faster than conventional supercomputing pipelines.",
                "content": "A landmark collaborative study published this week highlights the rapid transformation of pharmaceutical discovery. By marrying continuous tensor physics simulations with autoregressive pattern decoders, researchers have demonstrated accurate multi-step molecular synthesis that eliminates months of trial-and-error laboratory iterations.",
                "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                "category_id": category_map["artificial-intelligence"].id,
                "edition_id": edition_records.get(("en", today), None).id if edition_records.get(("en", today)) else None,
                "status": "published",
                "is_breaking": True,
                "is_featured": True
            },
            {
                "title": "Next-Gen Solid State Battery Architectures Enter Commercial Pilot Testing",
                "slug": "solid-state-battery-architectures-commercial-pilot",
                "language": "en",
                "description": "High-density ceramic electrolyte cells promise 800-kilometer vehicle ranges with ten-minute ultra-fast charging capabilities.",
                "content": "Energy storage conglomerates have initiated assembly of pilot production lines for ceramic-matrix solid state battery cells. Independent laboratory benchmarks corroborate thermal stability across unprecedented temperature ranges without thermal runaway degradation.",
                "image_url": "https://images.unsplash.com/photo-1558441719-8b489c63f7ce?auto=format&fit=crop&w=800&q=80",
                "category_id": category_map["technology"].id,
                "edition_id": edition_records.get(("en", today), None).id if edition_records.get(("en", today)) else None,
                "status": "published",
                "is_breaking": False,
                "is_featured": False
            },
            {
                "title": "Global Semiconductor Fab Network Expands Clean Room Infrastructure",
                "slug": "global-semiconductor-fab-expansion-clean-rooms",
                "language": "en",
                "description": "Sub-two-nanometer lithography plants gear up for mass commercial volume across modern industrial clusters.",
                "content": "Semiconductor manufacturing consortia confirmed scheduled operation of new multi-beam ultraviolet fabrication facilities, providing foundational microarchitecture for edge intelligence and cloud computing centers globally.",
                "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                "category_id": category_map["business"].id,
                "edition_id": edition_records.get(("en", today), None).id if edition_records.get(("en", today)) else None,
                "status": "published",
                "is_breaking": False,
                "is_featured": False
            },
            # Telugu Articles
            {
                "title": "తెలుగు రాష్ట్రాల్లో స్మార్ట్ అగ్రికల్చర్ విప్లవం: రైతులకు నేరుగా ఏఐ సాంకేతిక సలహాలు",
                "slug": "smart-agriculture-revolution-telugu-states-ai-farmers",
                "language": "te",
                "description": "ఉపగ్రహ సమాచారం మరియు వాతావరణ విశ్లేషణల ద్వారా పంట దిగుబడులను గణనీయంగా పెంచే అధునాతన సాంకేతిక వేదిక ప్రారంభం.",
                "content": "రైతన్నలకు పెట్టుబడి ఖర్చులు తగ్గించి, పంట నష్టాలను నివారించడానికి ఆధునిక డిజిటల్ వ్యవసాయ సలహా కేంద్రాన్ని అందుబాటులోకి తీసుకువచ్చారు. మొబైల్ కెమెరా ద్వారా పంట తెగుళ్లను గుర్తించి క్షణాల్లో పరిష్కారాలను సూచించే విధానం విస్తృత ఆదరణ పొందుతోంది.",
                "image_url": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
                "category_id": category_map["technology"].id,
                "edition_id": edition_records.get(("te", today), None).id if edition_records.get(("te", today)) else None,
                "status": "published",
                "is_breaking": True,
                "is_featured": True
            },
            {
                "title": "హైదరాబాద్ టెక్ రంగంలో సరికొత్త రికార్డు: మరో 50 అంతర్జాతీయ పరిశోధనా కేంద్రాలు",
                "slug": "hyderabad-tech-sector-new-record-50-global-research-centers",
                "language": "te",
                "description": "ప్రపంచ ప్రఖ్యాత టెక్ దిగ్గజాలు నగరంలో తమ కృత్రిమ మేధ మరియు ఇంజనీరింగ్ కేంద్రాలను భారీ ఎత్తున విస్తరిస్తున్నాయి.",
                "content": "ఐటీ మరియు లైఫ్ సైన్సెస్ రంగాల్లో హైదరాబాద్ అంతర్జాతీయ స్థాయిలో అగ్రగామిగా ఎదుగుతోంది. నూతన పరిశోధనా కేంద్రాల ద్వారా స్థానిక యువతకు పెద్ద సంఖ్యలో అధునాతన ఉద్యోగావకాశాలు లభించనున్నాయి.",
                "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                "category_id": category_map["business"].id,
                "edition_id": edition_records.get(("te", today), None).id if edition_records.get(("te", today)) else None,
                "status": "published",
                "is_breaking": False,
                "is_featured": False
            },
            # Hindi Articles
            {
                "title": "भारतीय अंतरिक्ष अनुसंधान में ऐतिहासिक छलांग: सौर वेधशाला ने प्रेषित किए प्रथम वैज्ञानिक आंकड़े",
                "slug": "isro-solar-observatory-mission-first-scientific-data",
                "language": "hi",
                "description": "सौर तूफानों और अंतरिक्ष मौसम के सटीक अध्ययन के लिए स्थापित स्वदेशी वेधशाला ने सफलतापूर्वक परीक्षण पूरा किया।",
                "content": "भारतीय वैज्ञानिकों ने अंतरिक्ष विज्ञान के क्षेत्र में एक और ऐतिहासिक उपलब्धि हासिल की है। उपग्रह में लगे अत्याधुनिक उपकरणों ने सौर वातावरण से उच्च-रिज़ॉल्यूशन छवियां और चुंबकीय डेटा पृथ्वी के ग्राउंड स्टेशनों को प्रेषित करना शुरू कर दिया है।",
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
                "category_id": category_map["health-science"].id,
                "edition_id": edition_records.get(("hi", today), None).id if edition_records.get(("hi", today)) else None,
                "status": "published",
                "is_breaking": True,
                "is_featured": True
            },
            {
                "title": "हरित ऊर्जा क्रांति: देश में सौर ऊर्जा उत्पादन 180 गीगावाट के ऐतिहासिक स्तर पर पहुंचा",
                "slug": "green-energy-revolution-india-solar-power-180-gw",
                "language": "hi",
                "description": "छत पर सोलर पैनल और बड़े सौर पार्कों के विस्तार से बिजली उत्पादन में नवीकरणीय ऊर्जा की हिस्सेदारी 45 प्रतिशत हुई।",
                "content": "पर्यावरण संरक्षण और ऊर्जा आत्मनिर्भरता की दिशा में भारत ने बड़ी सफलता हासिल की है। नवीन और नवीकरणीय ऊर्जा मंत्रालय के अनुसार देश भर में स्थापित सौर ऊर्जा परियोजनाओं से कार्बन उत्सर्जन में भारी कमी दर्ज की गई है।",
                "image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
                "category_id": category_map["national"].id,
                "edition_id": edition_records.get(("hi", today), None).id if edition_records.get(("hi", today)) else None,
                "status": "published",
                "is_breaking": False,
                "is_featured": False
            }
        ]

        for art in articles_data:
            existing_art = db.query(Article).filter(Article.slug == art["slug"]).first()
            if not existing_art:
                new_art = Article(**art)
                db.add(new_art)
                db.commit()

        print(f"[OK] Verified editorial articles across English, Telugu, and Hindi.")

        # 5. Seed YouTube News Videos - Exclusively Rise 'n' Shine
        videos_data = [
            {
                "title": "Rise ’n’ Shine Editorial Briefing: How AI is Reshaping Modern Scientific Discovery",
                "description": "An in-depth analysis of high-performance foundation models accelerating physics and biochemistry simulations.",
                "youtube_url": "https://www.youtube.com/watch?v=aircAruvnKk",
                "youtube_video_id": "aircAruvnKk",
                "thumbnail_url": "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
                "language": "en",
                "status": "published"
            }
        ]

        for vid in videos_data:
            existing_vid = db.query(Video).filter(Video.youtube_video_id == vid["youtube_video_id"]).first()
            if not existing_vid:
                new_vid = Video(**vid)
                db.add(new_vid)
                db.commit()

        print(f"[OK] Verified published YouTube video news entries.")

        # 6. Seed Homepage 3 Left & 3 Right Advertisements
        ads_data = [
            # Left 3 Ads
            {
                "title": "Quantum Compute Foundry - Enterprise Cloud QPU",
                "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/quantum",
                "side": "left",
                "position": 1,
                "is_active": True
            },
            {
                "title": "Renewable Clean Power Grid Summit 2026",
                "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/clean-energy",
                "side": "left",
                "position": 2,
                "is_active": True
            },
            {
                "title": "Autonomous Agricultural Sensor Suite",
                "image_url": "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/smart-agri",
                "side": "left",
                "position": 3,
                "is_active": True
            },
            # Right 3 Ads
            {
                "title": "Global Semiconductor Lithography Expo",
                "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/semiconductors",
                "side": "right",
                "position": 1,
                "is_active": True
            },
            {
                "title": "Bio-Molecular Synthesis Accelerator",
                "image_url": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/biotech",
                "side": "right",
                "position": 2,
                "is_active": True
            },
            {
                "title": "Deep-Space Communications Satellite Network",
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                "link_url": "https://example.com/satellite",
                "side": "right",
                "position": 3,
                "is_active": True
            }
        ]

        for ad in ads_data:
            existing_ad = db.query(Advertisement).filter(
                Advertisement.side == ad["side"],
                Advertisement.position == ad["position"]
            ).first()
            if not existing_ad:
                new_ad = Advertisement(**ad)
                db.add(new_ad)
                db.commit()

        print(f"[OK] Verified 3 left and 3 right sidebar advertisements.")

        # Seed initial audit log
        log_entry = AdminActivityLog(
            admin_id=admin.id,
            admin_email=admin.email,
            action="SYSTEM_INIT",
            entity_type="system",
            details="Database initialized with initial administrator, categories, multilingual editions, and articles."
        )
        db.add(log_entry)
        db.commit()
        print("[OK] Seeded initial admin audit activity log.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
