*================================================================
      * CLAIMS-BATCH — synthetic demo source, not production code.
      * Line numbers are stable — EvidenceRefs point into this file.
      * Module: COBOL z/OS nightly claims adjudication batch.
      *================================================================
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CLAIMS-BATCH.
      *----------------------------------------------------------------
      * Business purpose:
      *   Nightly batch that validates insurance claims, applies
      *   eligibility and policy rules, calculates payable amounts,
      *   and produces downstream payment and exception files.
      *----------------------------------------------------------------

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT POLICY-MASTER-FILE
               ASSIGN TO 'POLICY.MASTER'
               ORGANIZATION IS SEQUENTIAL.
           SELECT CLAIMS-INPUT-FILE
               ASSIGN TO 'CLAIMS.INPUT'
               ORGANIZATION IS SEQUENTIAL.
           SELECT PAYMENT-OUTBOUND-FILE
               ASSIGN TO 'PAYMENT.OUT'
               ORGANIZATION IS SEQUENTIAL.
           SELECT CLAIMS-EXCEPTION-FILE
               ASSIGN TO 'CLAIMS.EXCEPTION'
               ORGANIZATION IS SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  POLICY-MASTER-FILE.
       01  POLICY-MASTER-RECORD.
           05 POLICY-ID           PIC X(12).
           05 POLICY-START-DATE   PIC 9(8).
           05 POLICY-END-DATE     PIC 9(8).
           05 POLICY-STATUS       PIC X(1).

       FD  CLAIMS-INPUT-FILE.
       01  CLAIMS-INPUT-RECORD.
           05 CLAIM-ID            PIC X(16).
           05 MEMBER-ID           PIC X(12).
           05 PROVIDER-ID         PIC X(12).
           05 SERVICE-DATE        PIC 9(8).
           05 PROCEDURE-CODE      PIC X(8).
           05 CLAIM-AMOUNT        PIC 9(9)V99.

       FD  PAYMENT-OUTBOUND-FILE.
       01  PAYMENT-OUTBOUND-RECORD.
           05 PAYMENT-CLAIM-ID    PIC X(16).
           05 PAYMENT-AMOUNT      PIC 9(9)V99.
           05 PAYMENT-DATE        PIC 9(8).

       FD  CLAIMS-EXCEPTION-FILE.
       01  CLAIMS-EXCEPTION-RECORD.
           05 EXCEPTION-CLAIM-ID  PIC X(16).
           05 EXCEPTION-CODE      PIC X(4).
           05 EXCEPTION-DATE      PIC 9(8).

       WORKING-STORAGE SECTION.
       01  WS-SWITCHES.
           05 WS-EOF-CLAIMS        PIC X(1) VALUE 'N'.
           05 WS-DUPLICATE-FOUND   PIC X(1) VALUE 'N'.

       01  WS-HIGH-VALUE-THRESHOLD PIC 9(9)V99 VALUE 50000.00.

       01  WS-RUN-DATE             PIC 9(8).
       01  WS-CURRENT-DATE-FIELDS.
           05 WS-CURRENT-DATE      PIC 9(8).

       01  WS-DB2-CLAIM-COUNT      PIC 9(5) VALUE 0.

       PROCEDURE DIVISION.

       0000-MAIN.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-PROCESS-CLAIMS
               UNTIL WS-EOF-CLAIMS = 'Y'
           PERFORM 9000-FINALIZE
           STOP RUN.

       1000-INITIALIZE.
           OPEN INPUT  POLICY-MASTER-FILE
           OPEN INPUT  CLAIMS-INPUT-FILE
           OPEN OUTPUT PAYMENT-OUTBOUND-FILE
           OPEN OUTPUT CLAIMS-EXCEPTION-FILE
           MOVE FUNCTION CURRENT-DATE TO WS-RUN-DATE
           READ CLAIMS-INPUT-FILE
               AT END MOVE 'Y' TO WS-EOF-CLAIMS
           END-READ.

      *----------------------------------------------------------------
      * BR-001: CLAIM ELIGIBILITY WINDOW
      * A claim is eligible only when SERVICE-DATE falls within
      * POLICY-START-DATE and POLICY-END-DATE (inclusive).
      *----------------------------------------------------------------
       2000-PROCESS-CLAIMS.
           PERFORM 2100-CHECK-ELIGIBILITY
           IF WS-EOF-CLAIMS = 'N'
               PERFORM 2200-CHECK-DUPLICATE
               PERFORM 2300-ROUTE-OR-REJECT
           END-IF
           READ CLAIMS-INPUT-FILE
               AT END MOVE 'Y' TO WS-EOF-CLAIMS
           END-READ.

       2100-CHECK-ELIGIBILITY.
           IF SERVICE-DATE < POLICY-START-DATE
               OR SERVICE-DATE > POLICY-END-DATE
               PERFORM 8000-WRITE-EXCEPTION
                   WITH TEST BEFORE
               MOVE 'ELIG' TO EXCEPTION-CODE
           END-IF.

      *----------------------------------------------------------------
      * BR-003: DUPLICATE CLAIM SUPPRESSION
      * Composite key: MEMBER-ID + PROVIDER-ID + SERVICE-DATE +
      * PROCEDURE-CODE looked up against DB2.CLAIMS_HISTORY.
      *----------------------------------------------------------------
       2200-CHECK-DUPLICATE.
           MOVE 'N' TO WS-DUPLICATE-FOUND
           EXEC SQL
               SELECT COUNT(*) INTO :WS-DB2-CLAIM-COUNT
               FROM DB2.CLAIMS_HISTORY
               WHERE MEMBER_ID    = :MEMBER-ID
               AND   PROVIDER_ID  = :PROVIDER-ID
               AND   SERVICE_DATE = :SERVICE-DATE
               AND   PROC_CODE    = :PROCEDURE-CODE
           END-EXEC
           IF WS-DB2-CLAIM-COUNT > 0
               MOVE 'Y' TO WS-DUPLICATE-FOUND
               MOVE 'DUPL' TO EXCEPTION-CODE
               PERFORM 8000-WRITE-EXCEPTION
           END-IF.

      *----------------------------------------------------------------
      * BR-002: HIGH-VALUE CLAIM REVIEW
      * Claims exceeding WS-HIGH-VALUE-THRESHOLD are routed to
      * manual review; they do NOT write to PAYMENT-OUTBOUND-FILE.
      *----------------------------------------------------------------
       2300-ROUTE-OR-REJECT.
           IF WS-DUPLICATE-FOUND = 'N'
               IF CLAIM-AMOUNT > WS-HIGH-VALUE-THRESHOLD
                   MOVE 'HVWR' TO EXCEPTION-CODE
                   PERFORM 8000-WRITE-EXCEPTION
               ELSE
                   PERFORM 7000-WRITE-PAYMENT
               END-IF
           END-IF.

      *----------------------------------------------------------------
      * BR-004: EXCEPTION FILE GENERATION
      * All rejected / incomplete claims written to
      * CLAIMS-EXCEPTION-FILE consumed by operations next morning.
      *----------------------------------------------------------------
       8000-WRITE-EXCEPTION.
           MOVE CLAIM-ID   TO EXCEPTION-CLAIM-ID
           MOVE WS-RUN-DATE TO EXCEPTION-DATE
           WRITE CLAIMS-EXCEPTION-RECORD.

       7000-WRITE-PAYMENT.
           MOVE CLAIM-ID      TO PAYMENT-CLAIM-ID
           MOVE CLAIM-AMOUNT  TO PAYMENT-AMOUNT
           MOVE WS-RUN-DATE   TO PAYMENT-DATE
           WRITE PAYMENT-OUTBOUND-RECORD.

       9000-FINALIZE.
           CLOSE POLICY-MASTER-FILE
                 CLAIMS-INPUT-FILE
                 PAYMENT-OUTBOUND-FILE
                 CLAIMS-EXCEPTION-FILE.