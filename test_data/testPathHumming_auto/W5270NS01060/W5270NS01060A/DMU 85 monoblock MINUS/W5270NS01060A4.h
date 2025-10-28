1 BEGIN PGM W5270NS01060A4 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 20.10.2025
8 ; TIME  	  : 13:00
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T1755863337 | GUH-5640-AF8_H63H16L95 / DM=8 CR=0 TL=357
16 ; ---- TOOLLIST END ----------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-187 Y-55.5 Z-50.6
20 BLK FORM 0.2 X187 Y55.5 Z0.6
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 CYCL DEF 392 ATC~
   Q240=0 ;TUNING MODE~
   Q241=1 ;WEIGHT MODE
25 ; ----------------------------------
26 M127 ; SHORTER PATH TRAVERSE OF ROTARY AXES OFF
27 FUNCTION RESET TCPM
28 CALL LBL 1 ; RESET WORKING PLANE
29 ; --- SAFEPOSITION TOOL CALL -------
30 L Z0 R0 FMAX M91
31 L X0 R0 FMAX M91
32 L Y-425 R0 FMAX M91
33 ; ----------------------------------
34 L A0 R0 FMAX
35 ; ----------------------------------
36 * - TOOL: T1755863337 | GUH-5640-AF8_H63H16L95 / DM=8 CR=0 TL=357
37 TOOL CALL "AF08000002620277" Z S50 DL+0 DR+0
38 TOOL DEF 0
39 ; ----------------------------------
40 *   - JOB: 9: AF8
41 ; ----------------------------------
42 CALL LBL 1 ; RESET WORKING PLANE
43 FN 0:Q3=25 ; Z FEED RATE
44 ; --- SAFEPOSITION -----------------
45 L Z0 R0 FMAX M91
46 L X0 R0 FMAX M91
47 L Y-425 R0 FMAX M91
48 ; ----------------------------------
49 ; ----------------------------------
50 ; A-90 C0
51 ; ----------------------------------
52 CYCL DEF 7.0 DATUM SHIFT
53 CYCL DEF 7.1 X0
54 CYCL DEF 7.2 Y55
55 CYCL DEF 7.3 Z-25
56 PLANE SPATIAL SPA90 SPB0 SPC180 STAY SEQ- TABLE ROT
57 L A+Q120 C+Q122 R0 FMAX M126
58 L X-174.5 Y7 R0 F MAX M3
59 M7
60 L Z70 R0 F MAX
61 ; ----------------------------------
62 FN 0: Q1900=1
63 CALL LBL "CuttingEdgesCheck"
64 ; ----------------------------------
65 CYCL DEF 241 SINGLE-LIP DEEP-HOLE DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-85.499 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q211=0 ;DWELL TIME AT BOTTOM~
  Q203=0 ;SURFACE COORDINATE~
  Q204=70 ;2ND SET-UP CLEARANCE~
  Q379=15 ;STARTING POINT~
  Q253=50 ;F PRE-POSITIONING~
  Q208=300 ;RETRACTION FEED TIME~
  Q426=Q1901 ;DIR. OF SPINDLE ROT.~
  Q427=50 ;ROT. SPEED INFEED/OUT~
  Q428=1790 ;DRILLING SPEED~
  Q429=7 ;COOLANT ON~
  Q430=7 ;COOLANT OFF~
  Q435=0 ;DWELL DEPTH
66 L X-174.5 Y7 R0 F MAX M99
67 M9
68 M5
69 CALL LBL 1 ; RESET WORKING PLANE
70 ; --- SAFEPOSITION END -------------
71 L Z0 R0 FMAX M91
72 L X0 R0 FMAX M91
73 L Y-425 R0 FMAX M91
74 ; ----------------------------------
75 L A0 C0 R0 FMAX ; STRAIGTHEN ROTATIONAXES R1 R2
76 ; --- SAFEPOSITION END -------------
77 L Z0 R0 FMAX M91
78 L X0 R0 FMAX M91
79 L Y0 R0 FMAX M91
80 ; ----------------------------------
/81 M30
82 * --- LBL BEGIN --------------------
83 LBL 1 ; RESET WORKING PLANE
84 CYCL DEF 7.0 DATUM SHIFT
85 CYCL DEF 7.1 X0
86 CYCL DEF 7.2 Y0
87 CYCL DEF 7.3 Z0
88 PLANE RESET STAY
89 LBL 0
90 ; ----------------------------------
91 LBL "CuttingEdgesCheck"
92 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
93 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
94 LBL 0
95 ; ----------------------------------
96 LBL "CuttingEdges1"
97 FN 0: Q1901=4
98 LBL 0
99 ; ----------------------------------
100 LBL "CuttingEdges2"
101 FN 0: Q1901=3
102 LBL 0
103 ; ----------------------------------
104 END PGM W5270NS01060A4 MM
