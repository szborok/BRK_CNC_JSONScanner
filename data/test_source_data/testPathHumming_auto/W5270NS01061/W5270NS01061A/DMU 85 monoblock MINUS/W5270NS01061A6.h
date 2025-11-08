1 BEGIN PGM W5270NS01061A6 MM
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
15 ; T1903768932 | GUH-5678-KPF10_H63W10L120 / DM=10 CR=0 TL=166.5
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
36 * - TOOL: T1903768932 | GUH-5678-KPF10_H63W10L120 / DM=10 CR=0 TL=166.5
37 TOOL CALL "KW10000000460355" Z S1003 DL+0 DR+0
38 TOOL DEF 0
39 ; ----------------------------------
40 *   - JOB: 4: M9_letörés_5ax_01
41 ; ----------------------------------
42 CALL LBL 1 ; RESET WORKING PLANE
43 FN 0:Q3=50 ; Z FEED RATE
44 ; --- SAFEPOSITION -----------------
45 L Z0 R0 FMAX M91
46 L X0 R0 FMAX M91
47 L Y-425 R0 FMAX M91
48 ; ----------------------------------
49 ; ----------------------------------
50 ; A-90 C270
51 ; ----------------------------------
52 CYCL DEF 7.0 DATUM SHIFT
53 CYCL DEF 7.1 X186.5
54 CYCL DEF 7.2 Y0
55 CYCL DEF 7.3 Z-25
56 PLANE SPATIAL SPA90 SPB0 SPC90 STAY SEQ- TABLE ROT
57 L A+Q120 C+Q122 R0 FMAX M126
58 L X10 Y-5 R0 F MAX M3
59 M8
60 L Z69 R0 F MAX
61 CYCL DEF 200 DRILLING~
  Q200=3 ;SET-UP CLEARANCE~
  Q201=-4.75 ;DEPTH~
  Q206=Q3 ;FEED RATE FOR PLUNGING~
  Q202=4.75 ;PLUNGING DEPTH~
  Q210=0 ;DWELL TIME AT TOP~
  Q203=-1.5 ;SURFACE COORDINATE~
  Q204=70.5 ;2ND SET-UP CLEARANCE~
  Q211=0 ;DWELL TIME AT BOTTOM
62 L X10 Y-5 R0 F MAX M99
63 L X-22 Y-1 R0 F MAX M99
64 L X-45 Y-5 R0 F MAX M99
65 M9
66 M5
67 CALL LBL 1 ; RESET WORKING PLANE
68 ; --- SAFEPOSITION END -------------
69 L Z0 R0 FMAX M91
70 L X0 R0 FMAX M91
71 L Y-425 R0 FMAX M91
72 ; ----------------------------------
73 L A0 C0 R0 FMAX ; STRAIGTHEN ROTATIONAXES R1 R2
74 ; --- SAFEPOSITION END -------------
75 L Z0 R0 FMAX M91
76 L X0 R0 FMAX M91
77 L Y0 R0 FMAX M91
78 ; ----------------------------------
/79 M30
80 * --- LBL BEGIN --------------------
81 LBL 1 ; RESET WORKING PLANE
82 CYCL DEF 7.0 DATUM SHIFT
83 CYCL DEF 7.1 X0
84 CYCL DEF 7.2 Y0
85 CYCL DEF 7.3 Z0
86 PLANE RESET STAY
87 LBL 0
88 ; ----------------------------------
89 LBL "CuttingEdgesCheck"
90 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
91 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
92 LBL 0
93 ; ----------------------------------
94 LBL "CuttingEdges1"
95 FN 0: Q1901=4
96 LBL 0
97 ; ----------------------------------
98 LBL "CuttingEdges2"
99 FN 0: Q1901=3
100 LBL 0
101 ; ----------------------------------
102 END PGM W5270NS01061A6 MM
