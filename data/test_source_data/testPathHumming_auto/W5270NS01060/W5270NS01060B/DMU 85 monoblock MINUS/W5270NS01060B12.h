1 BEGIN PGM W5270NS01060B12 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 22.10.2025
8 ; TIME  	  : 13:51
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T459655128 | GUH-6736-S4R0_H63WM6L65X / DM=4 CR=0 TL=86
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
36 * - TOOL: T459655128 | GUH-6736-S4R0_H63WM6L65X / DM=4 CR=0 TL=86
37 TOOL CALL "SY04000000210337" Z S14324 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 16: felirat_horony
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q2=802 ; XY FEED RATE
43 FN 0:Q3=280 ; Z FEED RATE
44 FN 0:Q4=280 ; RED. FEED RATE
45 CYCL DEF 32.0 TOLERANCE
46 CYCL DEF 32.1 T0.0075
47 CYCL DEF 32.2 HSC-MODE:0
48 ; --- SAFEPOSITION -----------------
49 L Z0 R0 FMAX M91
50 L X0 R0 FMAX M91
51 L Y-425 R0 FMAX M91
52 ; ----------------------------------
53 ; ----------------------------------
54 ; A0 C0
55 ; ----------------------------------
56 CYCL DEF 7.0 DATUM SHIFT
57 CYCL DEF 7.1 X0
58 CYCL DEF 7.2 Y0
59 CYCL DEF 7.3 Z0
60 PLANE SPATIAL SPA0 SPB0 SPC0 STAY SEQ+ TABLE ROT
61 L A+Q120 C+Q122 R0 FMAX M126
62 L X-158.5 Y5 R0 F MAX M3
63 M26
64 L Z30 R0 F MAX
65 L Z2 R0 F MAX
66 L Z1 FQ3
67 L Y-5 Z0.8125 FQ2
68 L Y5 Z0.625
69 L Y-5 Z0.4375
70 L Y5 Z0.25
71 L Y-5 Z0.0625
72 L Y5 Z-0.125
73 L Y-5 Z-0.3125
74 L Y5 Z-0.5
75 L Y-5
76 L Z1
77 L Z30 R0 F MAX
78 CYCL DEF 32.0 TOLERANCE
79 CYCL DEF 32.1
80 M9
81 M5
82 CALL LBL 1 ; RESET WORKING PLANE
83 ; --- SAFEPOSITION END -------------
84 L Z0 R0 FMAX M91
85 L X0 R0 FMAX M91
86 L Y-425 R0 FMAX M91
87 ; ----------------------------------
88 ; --- SAFEPOSITION END -------------
89 L Z0 R0 FMAX M91
90 L X0 R0 FMAX M91
91 L Y0 R0 FMAX M91
92 ; ----------------------------------
/93 M30
94 * --- LBL BEGIN --------------------
95 LBL 1 ; RESET WORKING PLANE
96 CYCL DEF 7.0 DATUM SHIFT
97 CYCL DEF 7.1 X0
98 CYCL DEF 7.2 Y0
99 CYCL DEF 7.3 Z0
100 PLANE RESET STAY
101 LBL 0
102 ; ----------------------------------
103 LBL "CuttingEdgesCheck"
104 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
105 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
106 LBL 0
107 ; ----------------------------------
108 LBL "CuttingEdges1"
109 FN 0: Q1901=4
110 LBL 0
111 ; ----------------------------------
112 LBL "CuttingEdges2"
113 FN 0: Q1901=3
114 LBL 0
115 ; ----------------------------------
116 END PGM W5270NS01060B12 MM
