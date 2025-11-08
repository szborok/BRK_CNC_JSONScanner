1 BEGIN PGM W5270NS01061A3 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 20.10.2025
8 ; TIME  	  : 11:51
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T1558205463 | TOO-AF8x565_H63H16L95 / DM=8 CR=0 TL=610.5
16 ; ---- TOOLLIST END ----------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-185.5 Y-55.5 Z-50.6
20 BLK FORM 0.2 X185.5 Y55.5059 Z0.6
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
36 * - TOOL: T1558205463 | TOO-AF8x565_H63H16L95 / DM=8 CR=0 TL=610.5
37 TOOL CALL "AF08000005160277" Z S50 DL+0 DR+0
38 TOOL DEF 0
39 ; ----------------------------------
40 *   - JOB: 3: AF8
41 ; ----------------------------------
42 CALL LBL 1 ; RESET WORKING PLANE
43 FN 0:Q3=25 ; Z FEED RATE
44 ; --- SAFEPOSITION -----------------
45 L Z0 R0 FMAX M91
46 L X0 R0 FMAX M91
47 L Y-425 R0 FMAX M91
48 ; ----------------------------------
49 ; ----------------------------------
50 ; A-90 C270
51 ; ----------------------------------
52 CYCL DEF 7.0 DATUM SHIFT
53 CYCL DEF 7.1 X185
54 CYCL DEF 7.2 Y-22
55 CYCL DEF 7.3 Z-26
56 PLANE SPATIAL SPA90 SPB0 SPC90 STAY SEQ- TABLE ROT
57 L A+Q120 C+Q122 R0 FMAX M126
58 L X32 Y-4 R0 F MAX M3
59 M7
60 L Z3 R0 F MAX
61 ; ----------------------------------
62 FN 0: Q1900=1
63 CALL LBL "CuttingEdgesCheck"
64 ; ----------------------------------
65 CYCL DEF 241 SINGLE-LIP DEEP-HOLE DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-366 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q211=0 ;DWELL TIME AT BOTTOM~
  Q203=0 ;SURFACE COORDINATE~
  Q204=3 ;2ND SET-UP CLEARANCE~
  Q379=16 ;STARTING POINT~
  Q253=50 ;F PRE-POSITIONING~
  Q208=300 ;RETRACTION FEED TIME~
  Q426=Q1901 ;DIR. OF SPINDLE ROT.~
  Q427=50 ;ROT. SPEED INFEED/OUT~
  Q428=1790 ;DRILLING SPEED~
  Q429=7 ;COOLANT ON~
  Q430=7 ;COOLANT OFF~
  Q435=0 ;DWELL DEPTH
66 L X32 Y-4 R0 F MAX M99
67 L X0 Y0 R0 F MAX M99
68 M9
69 M5
70 CALL LBL 1 ; RESET WORKING PLANE
71 ; --- SAFEPOSITION END -------------
72 L Z0 R0 FMAX M91
73 L X0 R0 FMAX M91
74 L Y-425 R0 FMAX M91
75 ; ----------------------------------
76 L A0 C0 R0 FMAX ; STRAIGTHEN ROTATIONAXES R1 R2
77 ; --- SAFEPOSITION END -------------
78 L Z0 R0 FMAX M91
79 L X0 R0 FMAX M91
80 L Y0 R0 FMAX M91
81 ; ----------------------------------
/82 M30
83 * --- LBL BEGIN --------------------
84 LBL 1 ; RESET WORKING PLANE
85 CYCL DEF 7.0 DATUM SHIFT
86 CYCL DEF 7.1 X0
87 CYCL DEF 7.2 Y0
88 CYCL DEF 7.3 Z0
89 PLANE RESET STAY
90 LBL 0
91 ; ----------------------------------
92 LBL "CuttingEdgesCheck"
93 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
94 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
95 LBL 0
96 ; ----------------------------------
97 LBL "CuttingEdges1"
98 FN 0: Q1901=4
99 LBL 0
100 ; ----------------------------------
101 LBL "CuttingEdges2"
102 FN 0: Q1901=3
103 LBL 0
104 ; ----------------------------------
105 END PGM W5270NS01061A3 MM
