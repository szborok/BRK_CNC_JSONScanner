1 BEGIN PGM W5270NS01060A12 MM
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
15 ; T1438169081 | GUH-5740-MF_M14x1.50_hosszabbitoban_H63W20L80X / DM=14 CR=0 TL=251
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
36 * - TOOL: T1438169081 | GUH-5740-MF_M14x1.50_hosszabbitoban_H63W20L80X / DM=14 CR=0 TL=251
37 TOOL CALL "MF14000001710319" Z S114 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 14: M14x1,5
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=171 ; Z FEED RATE
43 ; --- SAFEPOSITION -----------------
44 L Z0 R0 FMAX M91
45 L X0 R0 FMAX M91
46 L Y-425 R0 FMAX M91
47 ; ----------------------------------
48 ; ----------------------------------
49 ; A-90 C0
50 ; ----------------------------------
51 CYCL DEF 7.0 DATUM SHIFT
52 CYCL DEF 7.1 X0
53 CYCL DEF 7.2 Y55
54 CYCL DEF 7.3 Z-25
55 PLANE SPATIAL SPA90 SPB0 SPC180 STAY SEQ- TABLE ROT
56 L A+Q120 C+Q122 R0 FMAX M126
57 L X127 Y7 R0 F MAX M3
58 M8
59 L Z57 R0 F MAX
60 L Z5 R0 F MAX
61 CYCL DEF 207 RIGID TAPPING NEW~
   Q200=3 ;SET-UP CLEARANCE~
   Q201=-13.5494 ;DEPTH~
   Q239=+1.5 ;THREAD PITCH~
   Q203=0 ;SURFACE COORDINATE~
   Q204=5 ;2ND SET-UP CLEARANCE
62 L X127 Y7 R0 F MAX M99
63 L X144 Y7 R0 F MAX M99
64 L X64 Y7 R0 F MAX M99
65 L X47 Y7 R0 F MAX M99
66 L X-16 Y7 R0 F MAX M99
67 L X-33 Y7 R0 F MAX M99
68 L X-96 Y7 R0 F MAX M99
69 L X-113 Y7 R0 F MAX M99
70 L Z57 R0 F MAX
71 M9
72 M5
73 CALL LBL 1 ; RESET WORKING PLANE
74 ; --- SAFEPOSITION END -------------
75 L Z0 R0 FMAX M91
76 L X0 R0 FMAX M91
77 L Y-425 R0 FMAX M91
78 ; ----------------------------------
79 L A0 C0 R0 FMAX ; STRAIGTHEN ROTATIONAXES R1 R2
80 ; --- SAFEPOSITION END -------------
81 L Z0 R0 FMAX M91
82 L X0 R0 FMAX M91
83 L Y0 R0 FMAX M91
84 ; ----------------------------------
/85 M30
86 * --- LBL BEGIN --------------------
87 LBL 1 ; RESET WORKING PLANE
88 CYCL DEF 7.0 DATUM SHIFT
89 CYCL DEF 7.1 X0
90 CYCL DEF 7.2 Y0
91 CYCL DEF 7.3 Z0
92 PLANE RESET STAY
93 LBL 0
94 ; ----------------------------------
95 LBL "CuttingEdgesCheck"
96 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
97 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
98 LBL 0
99 ; ----------------------------------
100 LBL "CuttingEdges1"
101 FN 0: Q1901=4
102 LBL 0
103 ; ----------------------------------
104 LBL "CuttingEdges2"
105 FN 0: Q1901=3
106 LBL 0
107 ; ----------------------------------
108 END PGM W5270NS01060A12 MM
