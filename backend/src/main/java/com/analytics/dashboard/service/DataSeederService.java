package com.analytics.dashboard.service;

import com.analytics.dashboard.config.DataSeederProperties;
import com.analytics.dashboard.model.PaymentMethod;
import com.analytics.dashboard.model.Transaction;
import com.analytics.dashboard.model.TransactionType;
import com.analytics.dashboard.model.User;
import com.analytics.dashboard.model.UserRole;
import com.analytics.dashboard.model.UserStatus;
import com.analytics.dashboard.repository.TransactionRepository;
import com.analytics.dashboard.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Large-scale data seeder service.
 * Generates 5,000+ users and 500,000+ transactions for performance testing.
 * 
 * Features:
 * - User activity distribution (10% high, 70% normal, 15% low, 5% new)
 * - Weighted randomness for transaction statuses and types
 * - Batch processing for memory efficiency
 * - Realistic data distribution
 * 
 * Usage: Set app.data-seeder.enabled=true in application.yml
 */
@Service
@Order(1) // Run after Flyway migrations
public class DataSeederService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final DataSeederProperties properties;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PlatformTransactionManager transactionManager;

    @PersistenceContext
    private EntityManager entityManager;

    // Manual constructor
    public DataSeederService(DataSeederProperties properties,
                            UserRepository userRepository,
                            TransactionRepository transactionRepository,
                            PlatformTransactionManager transactionManager) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.transactionManager = transactionManager;
    }

    @Override
    public void run(String... args) {
        if (!properties.isEnabled()) {
            log.info("Data seeder is disabled. Set app.data-seeder.enabled=true to enable.");
            return;
        }

        log.info("=".repeat(80));
        log.info("Starting large-scale data seeding...");
        log.info("Users: {}, Transactions: {}, Batch Size: {}",
                properties.getUserCount(), properties.getTransactionCount(), properties.getBatchSize());
        log.info("=".repeat(80));

        long startTime = System.currentTimeMillis();

        try {
            seedUsers();
            seedTransactions();
            
            long totalTime = System.currentTimeMillis() - startTime;
            log.info("=".repeat(80));
            log.info("Data seeding completed successfully in {} seconds", totalTime / 1000);
            log.info("Users created: {}", properties.getUserCount());
            log.info("Transactions created: {}", properties.getTransactionCount());
            log.info("=".repeat(80));
        } catch (Exception e) {
            log.error("Error during data seeding", e);
            throw new RuntimeException("Data seeding failed", e);
        }
    }

    /**
     * Generate users with activity distribution:
     * - 10% high activity (many transactions)
     * - 70% normal activity
     * - 15% low activity (few transactions)
     * - 5% new users (very few transactions)
     */
    public void seedUsers() {
        log.info("Generating {} users...", properties.getUserCount());
        long startTime = System.currentTimeMillis();

        List<User> users = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneYearAgo = now.minusYears(1); // Extended to 1 year for historical data

        // Activity distribution
        int highActivityCount = (int) (properties.getUserCount() * 0.10);      // 10%
        int normalActivityCount = (int) (properties.getUserCount() * 0.70);    // 70%
        int lowActivityCount = (int) (properties.getUserCount() * 0.15);       // 15%
        int newUserCount = properties.getUserCount() - highActivityCount - normalActivityCount - lowActivityCount; // 5%

        int userIndex = 0;

        // Generate high activity users (spread over 1 year)
        for (int i = 0; i < highActivityCount; i++) {
            users.add(createUser(userIndex++, "HIGH", oneYearAgo, now));
        }

        // Generate normal activity users
        for (int i = 0; i < normalActivityCount; i++) {
            users.add(createUser(userIndex++, "NORMAL", oneYearAgo, now));
        }

        // Generate low activity users
        for (int i = 0; i < lowActivityCount; i++) {
            users.add(createUser(userIndex++, "LOW", oneYearAgo, now));
        }

        // Generate new users (created in last 30 days)
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        for (int i = 0; i < newUserCount; i++) {
            users.add(createUser(userIndex++, "NEW", thirtyDaysAgo, now));
        }

        // Batch insert users
        batchInsertUsers(users);

        long totalTime = System.currentTimeMillis() - startTime;
        log.info("Generated {} users in {} seconds", users.size(), totalTime / 1000);
    }

    /**
     * Create a user with realistic data.
     */
    private User createUser(int index, String activityLevel, LocalDateTime startDate, LocalDateTime endDate) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        
        // Generate random creation date within range
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        LocalDateTime createdAt = startDate.plusDays(random.nextLong(0, daysBetween + 1))
                .plusHours(random.nextInt(0, 24))
                .plusMinutes(random.nextInt(0, 60));

        // Name generation
        String[] firstNames = {"Raj", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavya",
                "Arjun", "Meera", "Siddharth", "Divya", "Karan", "Isha", "Rahul", "Pooja"};
        String[] lastNames = {"Sharma", "Patel", "Kumar", "Singh", "Gupta", "Reddy", "Mehta", "Joshi",
                "Verma", "Agarwal", "Malhotra", "Iyer", "Nair", "Rao", "Chopra", "Desai"};
        
        String firstName = firstNames[random.nextInt(firstNames.length)];
        String lastName = lastNames[random.nextInt(lastNames.length)];
        String fullName = firstName + " " + lastName;
        
        // Email generation (unique)
        String email = String.format("%s.%s.%d@example.com", 
                firstName.toLowerCase(), lastName.toLowerCase(), index);

        // Phone number (India format: 10 digits)
        String phoneNumber = "+91" + String.format("%010d", 7000000000L + index);

        // Role distribution: 70% CUSTOMER, 25% MERCHANT, 5% ADMIN
        UserRole role = random.nextDouble() < 0.70 ? UserRole.CUSTOMER :
                        random.nextDouble() < 0.95 ? UserRole.MERCHANT : UserRole.ADMIN;

        // Status distribution: 90% ACTIVE, 10% SUSPENDED
        UserStatus status = random.nextDouble() < 0.90 ? UserStatus.ACTIVE : UserStatus.SUSPENDED;

        // Create user using reflection to set all fields (Lombok may not be processing)
        User user = new User();
        setField(user, "fullName", fullName);
        setField(user, "email", email);
        setField(user, "phoneNumber", phoneNumber);
        setField(user, "role", role);
        setField(user, "status", status);
        setField(user, "createdAt", createdAt);
        setField(user, "updatedAt", createdAt);

        return user;
    }

    /**
     * Batch insert users with memory management and programmatic transaction.
     */
    private void batchInsertUsers(List<User> users) {
        int batchSize = properties.getBatchSize();
        int total = users.size();
        
        for (int i = 0; i < total; i += batchSize) {
            int end = Math.min(i + batchSize, total);
            List<User> batch = users.subList(i, end);
            
            // Programmatic transaction for each batch
            DefaultTransactionDefinition def = new DefaultTransactionDefinition();
            def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            org.springframework.transaction.TransactionStatus txStatus = transactionManager.getTransaction(def);
            
            try {
                userRepository.saveAll(batch);
                entityManager.flush();
                entityManager.clear();
                transactionManager.commit(txStatus);
            } catch (Exception e) {
                transactionManager.rollback(txStatus);
                throw e;
            }
            
            if ((i / batchSize + 1) % 2 == 0 || end == total) {
                log.info("Saved users: {}/{} ({}%)", end, total, (end * 100 / total));
            }
        }
    }

    /**
     * Generate transactions with weighted randomness and realistic distribution.
     */
    public void seedTransactions() {
        log.info("Generating {} transactions...", properties.getTransactionCount());
        long startTime = System.currentTimeMillis();

        // Get all users
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.error("No users found. Cannot generate transactions.");
            return;
        }

        // Categorize users by activity level
        Map<String, List<User>> usersByActivity = categorizeUsersByActivity(users);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneYearAgo = now.minusYears(1); // Extended to 1 year for historical data

        List<Transaction> transactions = new ArrayList<>();
        int transactionIndex = 0;
        int batchCount = 0;

        // Generate transactions with weighted distribution
        while (transactionIndex < properties.getTransactionCount()) {
            // Select user based on activity level
            User user = selectUserByActivity(usersByActivity);
            
            // Generate transaction date (spread over last 1 year)
            LocalDateTime transactionDate = generateTransactionDate(oneYearAgo, now);
            
            // Create transaction with weighted randomness
            Transaction transaction = createTransaction(user, transactionDate, transactionIndex);
            transactions.add(transaction);
            transactionIndex++;

            // Batch insert
            if (transactions.size() >= properties.getBatchSize()) {
                batchInsertTransactions(transactions);
                transactions.clear();
                batchCount++;
                
                if (batchCount % 10 == 0) {
                    log.info("Generated transactions: {}/{} ({}%)", 
                            transactionIndex, properties.getTransactionCount(),
                            (transactionIndex * 100 / properties.getTransactionCount()));
                }
            }
        }

        // Insert remaining transactions
        if (!transactions.isEmpty()) {
            batchInsertTransactions(transactions);
        }

        long totalTime = System.currentTimeMillis() - startTime;
        log.info("Generated {} transactions in {} seconds", 
                properties.getTransactionCount(), totalTime / 1000);
    }

    /**
     * Categorize users by their creation date to determine activity level.
     */
    private Map<String, List<User>> categorizeUsersByActivity(List<User> users) {
        Map<String, List<User>> categorized = new HashMap<>();
        categorized.put("HIGH", new ArrayList<>());
        categorized.put("NORMAL", new ArrayList<>());
        categorized.put("LOW", new ArrayList<>());
        categorized.put("NEW", new ArrayList<>());

        // Sort users by creation date using reflection
        users.sort((u1, u2) -> {
            try {
                LocalDateTime d1 = (LocalDateTime) getField(u1, "createdAt");
                LocalDateTime d2 = (LocalDateTime) getField(u2, "createdAt");
                if (d1 == null && d2 == null) return 0;
                if (d1 == null) return -1;
                if (d2 == null) return 1;
                return d1.compareTo(d2);
            } catch (Exception e) {
                return 0; // If reflection fails, maintain order
            }
        });

        int total = users.size();
        int highCount = (int) (total * 0.10);
        int normalCount = (int) (total * 0.70);
        int lowCount = (int) (total * 0.15);

        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            if (i < highCount) {
                categorized.get("HIGH").add(user);
            } else if (i < highCount + normalCount) {
                categorized.get("NORMAL").add(user);
            } else if (i < highCount + normalCount + lowCount) {
                categorized.get("LOW").add(user);
            } else {
                categorized.get("NEW").add(user);
            }
        }

        return categorized;
    }

    /**
     * Select user based on activity level with weighted probability.
     * High activity users get more transactions.
     */
    private User selectUserByActivity(Map<String, List<User>> usersByActivity) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double rand = random.nextDouble();

        // Weighted selection: HIGH (40%), NORMAL (45%), LOW (10%), NEW (5%)
        if (rand < 0.40 && !usersByActivity.get("HIGH").isEmpty()) {
            List<User> highUsers = usersByActivity.get("HIGH");
            return highUsers.get(random.nextInt(highUsers.size()));
        } else if (rand < 0.85 && !usersByActivity.get("NORMAL").isEmpty()) {
            List<User> normalUsers = usersByActivity.get("NORMAL");
            return normalUsers.get(random.nextInt(normalUsers.size()));
        } else if (rand < 0.95 && !usersByActivity.get("LOW").isEmpty()) {
            List<User> lowUsers = usersByActivity.get("LOW");
            return lowUsers.get(random.nextInt(lowUsers.size()));
        } else if (!usersByActivity.get("NEW").isEmpty()) {
            List<User> newUsers = usersByActivity.get("NEW");
            return newUsers.get(random.nextInt(newUsers.size()));
        } else {
            // Fallback to any user
            List<User> allUsers = new ArrayList<>();
            usersByActivity.values().forEach(allUsers::addAll);
            return allUsers.get(random.nextInt(allUsers.size()));
        }
    }

    /**
     * Generate transaction date spread over last 1 year.
     * More recent dates get slightly more weight.
     */
    private LocalDateTime generateTransactionDate(LocalDateTime startDate, LocalDateTime endDate) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        
        // Slight bias towards recent dates (exponential distribution)
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        double bias = Math.pow(random.nextDouble(), 0.7); // Bias towards 1.0 (recent)
        long daysOffset = (long) (daysBetween * (1 - bias));
        
        return startDate.plusDays(daysOffset)
                .plusHours(random.nextInt(0, 24))
                .plusMinutes(random.nextInt(0, 60))
                .plusSeconds(random.nextInt(0, 60));
    }

    /**
     * Create transaction with weighted randomness and realistic data.
     */
    private Transaction createTransaction(User user, LocalDateTime createdAt, int index) {
        ThreadLocalRandom random = ThreadLocalRandom.current();

        // Transaction Type: PAYIN (80%), PAYOUT (12%), REFUND (8%)
        TransactionType type = selectWeighted(
                Map.of(TransactionType.PAYIN, 0.80,
                       TransactionType.PAYOUT, 0.12,
                       TransactionType.REFUND, 0.08));

        // Transaction Status: SUCCESS (75%), FAILED (15%), PENDING (10%)
        com.analytics.dashboard.model.TransactionStatus status = selectWeighted(
                Map.of(com.analytics.dashboard.model.TransactionStatus.SUCCESS, 0.75,
                       com.analytics.dashboard.model.TransactionStatus.FAILED, 0.15,
                       com.analytics.dashboard.model.TransactionStatus.PENDING, 0.10));

        // Payment Method: UPI (50%), CREDIT_CARD (30%), WALLETS (20%)
        PaymentMethod paymentMethod = selectWeighted(
                Map.of(PaymentMethod.UPI, 0.50,
                       PaymentMethod.CREDIT_CARD, 0.30,
                       PaymentMethod.WALLETS, 0.20));

        // Amount distribution (realistic payment amounts)
        BigDecimal amount = generateRealisticAmount(type, random);

        // Currency (default INR for India-first)
        String currency = "INR";

        // Payment provider (for UPI, WALLETS)
        String paymentProvider = generatePaymentProvider(paymentMethod, random);

        // Failure reason (only for FAILED transactions)
        String failureReason = null;
        if (status == com.analytics.dashboard.model.TransactionStatus.FAILED) {
            failureReason = selectWeighted(
                    Map.of("INSUFFICIENT_FUNDS", 0.30,
                           "BANK_SERVER_DOWN", 0.20,
                           "NPCI_TIMEOUT", 0.15,
                           "USER_ABORTED", 0.15,
                           "INVALID_UPI_ID", 0.10,
                           "UNKNOWN_ERROR", 0.10));
        }

        // Create transaction using reflection to set all fields
        Transaction transaction = new Transaction();
        setField(transaction, "user", user);
        setField(transaction, "amount", amount);
        setField(transaction, "currency", currency);
        setField(transaction, "type", type);
        setField(transaction, "status", status);
        setField(transaction, "paymentMethod", paymentMethod);
        setField(transaction, "paymentProvider", paymentProvider);
        setField(transaction, "failureReason", failureReason);
        setField(transaction, "createdAt", createdAt);
        setField(transaction, "updatedAt", createdAt);

        return transaction;
    }

    /**
     * Generate realistic transaction amount based on type.
     */
    private BigDecimal generateRealisticAmount(TransactionType type, ThreadLocalRandom random) {
        double amount;
        
        switch (type) {
            case PAYIN:
                // Payin: Most between 100-5000 INR, some larger
                if (random.nextDouble() < 0.70) {
                    amount = 100 + (random.nextDouble() * 4900); // 100-5000
                } else if (random.nextDouble() < 0.90) {
                    amount = 5000 + (random.nextDouble() * 45000); // 5000-50000
                } else {
                    amount = 50000 + (random.nextDouble() * 450000); // 50000-500000
                }
                break;
            case PAYOUT:
                // Payout: Typically medium amounts, 500-20000
                amount = 500 + (random.nextDouble() * 19500);
                break;
            case REFUND:
                // Refund: Typically smaller, 50-5000
                amount = 50 + (random.nextDouble() * 4950);
                break;
            default:
                amount = 100 + (random.nextDouble() * 4900);
        }

        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Generate payment provider name based on payment method.
     */
    private String generatePaymentProvider(PaymentMethod paymentMethod, ThreadLocalRandom random) {
        switch (paymentMethod) {
            case UPI:
                String[] upiProviders = {"PhonePe", "GooglePay", "Paytm", "BHIM", "AmazonPay"};
                return upiProviders[random.nextInt(upiProviders.length)];
            case WALLETS:
                String[] wallets = {"Paytm", "PhonePe", "AmazonPay", "Mobikwik", "Freecharge"};
                return wallets[random.nextInt(wallets.length)];
            case CREDIT_CARD:
                String[] cards = {"Visa", "Mastercard", "RuPay", "Amex"};
                return cards[random.nextInt(cards.length)];
            default:
                return null;
        }
    }

    /**
     * Select value based on weighted probability.
     */
    private <T> T selectWeighted(Map<T, Double> weights) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        double rand = random.nextDouble();
        double cumulative = 0.0;

        for (Map.Entry<T, Double> entry : weights.entrySet()) {
            cumulative += entry.getValue();
            if (rand <= cumulative) {
                return entry.getKey();
            }
        }

        // Fallback to first entry
        return weights.keySet().iterator().next();
    }

    /**
     * Batch insert transactions with memory management and programmatic transaction.
     */
    private void batchInsertTransactions(List<Transaction> transactions) {
        // Programmatic transaction for each batch
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        org.springframework.transaction.TransactionStatus txStatus = transactionManager.getTransaction(def);
        
        try {
            transactionRepository.saveAll(transactions);
            entityManager.flush();
            entityManager.clear();
            transactionManager.commit(txStatus);
        } catch (Exception e) {
            transactionManager.rollback(txStatus);
            throw e;
        }
    }

    /**
     * Helper method to set field values using reflection.
     * Used because Lombok setters may not be processed.
     */
    private void setField(Object obj, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            log.warn("Failed to set field {} using reflection: {}", fieldName, e.getMessage());
            // Try using setter method as fallback
            try {
                String setterName = "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                java.lang.reflect.Method setter = obj.getClass().getMethod(setterName, value.getClass());
                setter.invoke(obj, value);
            } catch (Exception ex) {
                log.error("Failed to set field {} using setter: {}", fieldName, ex.getMessage());
            }
        }
    }

    /**
     * Helper method to get field values using reflection.
     */
    private Object getField(Object obj, String fieldName) {
        try {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (Exception e) {
            // Try using getter method as fallback
            try {
                String getterName = "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                java.lang.reflect.Method getter = obj.getClass().getMethod(getterName);
                return getter.invoke(obj);
            } catch (Exception ex) {
                log.warn("Failed to get field {}: {}", fieldName, ex.getMessage());
                return null;
            }
        }
    }
}
